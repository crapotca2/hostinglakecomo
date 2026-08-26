# -*- coding: utf-8 -*-
"""
Bold preservation script for Contratto_HostComo_v8.md
Rules:
 1. Macro-section header: line that is ONLY **N. NAME**  (N = 1-2 digits)
 2. Article rubric: bold immediately preceded by N.N(-bis)?. on same/prev token
    OR the bold itself starts the paragraph as **N.N(-bis)?. Title.**
 3. List letter: inner content matches ^[a-z]\\)$
 4. Roman list:  inner content matches ^[ivxIVX]+\\)$
 5. Sub-clause:  inner content matches ^\\([a-z]\\.\\d+\\)$
 6. Glossary term: preceded by " and followed by ":
All other bold spans are unwrapped (** removed, inner text kept).
"""
import re, sys, io

PATH = r"C:\Users\Andrei\Desktop\Contratto_HostComo_v8.md"

with io.open(PATH, "r", encoding="utf-8") as f:
    text = f.read()

# Non-greedy bold span: **content** where content has no '**' inside.
BOLD_RE = re.compile(r"\*\*((?:(?!\*\*).)+?)\*\*", re.DOTALL)

re_section_header_inner = re.compile(r"^\d{1,2}\.\s+[A-ZÀ-Ü][A-ZÀ-Ü\s,;:'\(\)\-]+$")
re_list_letter         = re.compile(r"^[a-z]\)$")
re_roman_list          = re.compile(r"^[ivxIVX]+\)$")
re_sub_clause          = re.compile(r"^\([a-z]\.\d+\)$")
re_article_rubric_prev = re.compile(r"(?:^|\n)\s*\d+\.\d+(?:-bis)?\.\s*$")
re_article_rubric_inner= re.compile(r"^\d+\.\d+(?:-bis)?\.\s+.+\.$")

kept = 0
removed = 0

def decide(m):
    global kept, removed
    inner = m.group(1)
    s = m.start()
    e = m.end()

    # Rule 1: macro-section header on its own line.
    # span preceded by \n\n or BOF, followed by \n or EOF, inner matches header regex
    before_ok = (s == 0) or text[max(0, s-2):s] == "\n\n" or text[s-1:s] == "\n"
    # require strictly a line that is ONLY the bold:
    line_start = text.rfind("\n", 0, s) + 1
    line_end   = text.find("\n", e)
    if line_end == -1: line_end = len(text)
    line_content = text[line_start:line_end]
    if line_content == m.group(0) and re_section_header_inner.match(inner):
        kept += 1
        return m.group(0)

    # Rule 2a: article rubric — prev ~30 chars end with "N.N(-bis)?. "
    prev = text[max(0, s-30):s]
    if re_article_rubric_prev.search(prev):
        kept += 1
        return m.group(0)

    # Rule 2b: bold is itself the paragraph-leading rubric "**N.N(-bis)?. Title.**"
    # Verify it starts a paragraph (preceded by \n\n or BOF) and inner matches
    para_start = (s == 0) or text[max(0, s-2):s] == "\n\n"
    if para_start and re_article_rubric_inner.match(inner):
        kept += 1
        return m.group(0)

    # Rule 3: list letter
    if re_list_letter.match(inner):
        kept += 1
        return m.group(0)

    # Rule 4: roman list
    if re_roman_list.match(inner):
        kept += 1
        return m.group(0)

    # Rule 5: sub-clause (a.1) (b.2) etc.
    if re_sub_clause.match(inner):
        kept += 1
        return m.group(0)

    # Rule 6: glossary term — preceded by '"' and followed by '":'
    before_char = text[s-1:s] if s > 0 else ""
    after_two   = text[e:e+2]
    if before_char == '"' and after_two == '":':
        kept += 1
        return m.group(0)

    # Default: unwrap
    removed += 1
    return inner

new_text = BOLD_RE.sub(decide, text)

with io.open(PATH, "w", encoding="utf-8", newline="") as f:
    f.write(new_text)

print("KEPT={} REMOVED={}".format(kept, removed))
