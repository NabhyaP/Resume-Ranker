from rapidfuzz import fuzz
from src.config import SECTION_HEADERS


def find_section_positions(text, threshold = 80):
    positions = {}
    lines = text.split('\n')
    i = 0
    for line in lines:
        if not line:
            i += 1
            continue
        
        for section, keywords in SECTION_HEADERS.items():
            for keyword in keywords:
                line_lower = line.lower()
                score = max(
                    fuzz.ratio(line_lower, keyword),
                    fuzz.token_sort_ratio(line_lower, keyword)
                )
                if score >= threshold:
                    positions[i] = section
                    break
        
        i += len(line)+1

    return positions


def split_sections(text):
    positions = find_section_positions(text)

    if not positions:
        return {key: "" for key in SECTION_HEADERS.keys()} | {"full_text": text}

    sorted_sections = sorted(positions.items(), key=lambda x: x[0])
    extracted = {}

    for key in SECTION_HEADERS.keys():
        extracted[key] = ""
    
    for i, (start_pos, section) in enumerate(sorted_sections):
        if i + 1 < len(sorted_sections):
            end_pos = sorted_sections[i + 1][0]
        else:
            end_pos = len(text)

        header_end = text.find('\n', start_pos)
        if header_end != -1 and header_end < end_pos:
            start_pos = header_end + 1

        extracted[section] += text[start_pos:end_pos].strip()

    return extracted