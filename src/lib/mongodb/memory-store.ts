/**
 * In-memory storage that implements a minimal MongoDB Collection interface.
 * Used when MONGODB_URI is not set or MongoDB is not available.
 * Data persists only for the lifetime of the dev server process.
 */

import { ObjectId } from "mongodb";

type Doc = Record<string, any> & { _id?: ObjectId };

class MemoryCollection<T extends Doc> {
  private docs: T[] = [];
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    return this.docs.find((doc) => this.matches(doc, filter)) || null;
  }

  find(filter: Record<string, any> = {}) {
    const results = this.docs.filter((doc) => this.matches(doc, filter));
    const cursor = {
      sort: (sortSpec: Record<string, number>) => {
        const key = Object.keys(sortSpec)[0];
        const dir = sortSpec[key];
        results.sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          if (av < bv) return -dir;
          if (av > bv) return dir;
          return 0;
        });
        return cursor;
      },
      toArray: async () => results,
    };
    return cursor;
  }

  aggregate(pipeline: any[]) {
    let results: any[] = [...this.docs];

    for (const stage of pipeline) {
      if (stage.$match) {
        results = results.filter((doc) => this.matches(doc, stage.$match));
      }
      if (stage.$sort) {
        const key = Object.keys(stage.$sort)[0];
        const dir = stage.$sort[key];
        results.sort((a, b) => {
          if (a[key] < b[key]) return -dir;
          if (a[key] > b[key]) return dir;
          return 0;
        });
      }
      if (stage.$lookup) {
        const { from, localField, foreignField, as: asField } = stage.$lookup;
        const foreignCol = memoryStore.getCollection(from);
        for (const doc of results) {
          const localVal = doc[localField];
          if (localVal) {
            const foreignDocs = (foreignCol as any).docs.filter(
              (fd: any) => fd[foreignField]?.toString() === localVal?.toString()
            );
            (doc as any)[asField] = foreignDocs;
          } else {
            (doc as any)[asField] = [];
          }
        }
      }
      if (stage.$unwind) {
        const field = typeof stage.$unwind === "string"
          ? stage.$unwind.replace("$", "")
          : stage.$unwind.path.replace("$", "");
        const preserveNull = stage.$unwind?.preserveNullAndEmptyArrays;
        const expanded: any[] = [];
        for (const doc of results) {
          const arr = doc[field];
          if (Array.isArray(arr) && arr.length > 0) {
            for (const item of arr) {
              expanded.push({ ...doc, [field]: item });
            }
          } else if (preserveNull) {
            expanded.push({ ...doc, [field]: null });
          }
        }
        results = expanded;
      }
      if (stage.$addFields) {
        for (const doc of results) {
          for (const [key, expr] of Object.entries(stage.$addFields)) {
            if (typeof expr === "object" && expr !== null && "$arrayElemAt" in (expr as any)) {
              const [arrField, idx] = (expr as any).$arrayElemAt;
              const arr = doc[arrField.replace("$", "")];
              doc[key] = Array.isArray(arr) ? arr[idx] : null;
            }
          }
        }
      }
      if (stage.$project) {
        results = results.map((doc) => {
          const projected: any = {};
          for (const [key, val] of Object.entries(stage.$project)) {
            if (val) projected[key] = doc[key];
          }
          if (!("_id" in stage.$project) || stage.$project._id !== 0) {
            projected._id = doc._id;
          }
          return projected;
        });
      }
    }

    return {
      toArray: async () => results,
      next: async () => results[0] || null,
    };
  }

  async insertOne(doc: T): Promise<{ insertedId: ObjectId }> {
    const _id = doc._id || new ObjectId();
    const toInsert = { ...doc, _id } as T;
    this.docs.push(toInsert);
    return { insertedId: _id };
  }

  async updateOne(
    filter: Record<string, any>,
    update: Record<string, any>
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    const idx = this.docs.findIndex((doc) => this.matches(doc, filter));
    if (idx === -1) return { matchedCount: 0, modifiedCount: 0 };

    if (update.$set) {
      this.docs[idx] = { ...this.docs[idx], ...update.$set };
    }
    if (update.$inc) {
      for (const [key, val] of Object.entries(update.$inc)) {
        (this.docs[idx] as any)[key] = ((this.docs[idx] as any)[key] || 0) + (val as number);
      }
    }

    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(
    filter: Record<string, any>
  ): Promise<{ deletedCount: number }> {
    const idx = this.docs.findIndex((doc) => this.matches(doc, filter));
    if (idx === -1) return { deletedCount: 0 };
    this.docs.splice(idx, 1);
    return { deletedCount: 1 };
  }

  async deleteMany(
    filter: Record<string, any>
  ): Promise<{ deletedCount: number }> {
    const before = this.docs.length;
    this.docs = this.docs.filter((doc) => !this.matches(doc, filter));
    return { deletedCount: before - this.docs.length };
  }

  async countDocuments(filter: Record<string, any> = {}): Promise<number> {
    return this.docs.filter((doc) => this.matches(doc, filter)).length;
  }

  private matches(doc: any, filter: Record<string, any>): boolean {
    for (const [key, val] of Object.entries(filter)) {
      const docVal = doc[key];
      if (val instanceof ObjectId) {
        if (docVal?.toString() !== val.toString()) return false;
      } else if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        // Handle $in, $regex, etc. — basic support
        if ("$in" in val) {
          if (!val.$in.some((v: any) => v?.toString() === docVal?.toString())) return false;
        }
      } else {
        if (docVal?.toString() !== val?.toString()) return false;
      }
    }
    return true;
  }
}

class MemoryStore {
  private collections = new Map<string, MemoryCollection<any>>();

  getCollection<T extends Doc>(name: string): MemoryCollection<T> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MemoryCollection<T>(name));
    }
    return this.collections.get(name)! as MemoryCollection<T>;
  }
}

// Singleton
declare global {
  var _memoryStore: MemoryStore | undefined;
}

if (!global._memoryStore) {
  global._memoryStore = new MemoryStore();
}

export const memoryStore = global._memoryStore;
