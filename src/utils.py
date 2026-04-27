import re
import nltk

for _corpus in ("wordnet", "omw-1.4", "punkt", "averaged_perceptron_tagger"):
    try:
        nltk.data.find(f"corpora/{_corpus}" if _corpus not in ("punkt", "averaged_perceptron_tagger") else f"tokenizers/{_corpus}" if _corpus == "punkt" else f"taggers/{_corpus}")
    except LookupError:
        nltk.download(_corpus, quiet=True)

from nltk.stem import WordNetLemmatizer

lemmatizer = WordNetLemmatizer()

def normalize_text(text):
    text = re.sub(r'\r', '\n', text)
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    sentences = text.split('\n')
    sentences = [sentence.split() for sentence in sentences]
    for i in range(len(sentences)):
        sentences[i] = [lemmatizer.lemmatize(word) for word in sentences[i]]
        sentences[i] = " ".join(sentences[i])
    return "\n".join(sentences)
