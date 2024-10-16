# Generate book files:
# - PDF
# - PDF, content only
# - EPUB
# - EPUB, for Kindle (1.6 cover aspect ratio)

# TODO: PDF: Make table headers bold
# TODO: PDF: Size individual illustrations

BOOK_FILE="washing-code"
BOOK_TITLE="Washing your code: clean code for frontend developers"
CHAPTERS_FILES_EPUB="generator/settings.md generator/content-epub/*.md"
CHAPTERS_FILES_PDF="generator/settings.md generator/content-pdf/*.md"
SOURCE_FORMAT="commonmark_x+implicit_figures"
VERSION="$(date "+%B %e, %Y")"

mkdir -p "dist"

# Generate PDF
echo
echo "[BUILD] Generating PDF ebook..."

# Available PDF engines:
# - pdflatex: default
# - lualatex: doesn't support \DeclareUnicodeCharacter, broken fonts
# - xelatex: doesn't support \DeclareUnicodeCharacter, broken fonts

# Syntax highlighting theme docs:
# https://docs.kde.org/stable5/en/kate/katepart/highlight.html

pandoc $CHAPTERS_FILES_PDF \
  --resource-path="manuscript/resources" \
  --output="dist/$BOOK_FILE-content.pdf" \
  --pdf-engine=pdflatex \
  --dpi=192 \
  --top-level-division=chapter \
  --table-of-contents --toc-depth=2 \
  --template="generator/eisvogel.latex" \
  --highlight-style "generator/theme.theme" \
  --syntax-definition "generator/syntax/javascript.xml" \
  --syntax-definition "generator/syntax/javascript-react.xml" \
  --syntax-definition "generator/syntax/typescript.xml" \
  --syntax-definition "generator/syntax/typescript-react.xml" \
  --syntax-definition "generator/syntax/pascal.xml" \
  --syntax-definition "generator/syntax/diff.xml" \
  --lua-filter "generator/filters/tips.lua" \
  --from "$SOURCE_FORMAT" \
  -M date="$VERSION"

# Attach the cover and save as a separate files
pdfunite "media/cover.pdf" "dist/$BOOK_FILE-content.pdf" "dist/$BOOK_FILE.pdf"

# Generate Epub
echo
echo "[BUILD] Generating Epub ebook..."

pandoc $CHAPTERS_FILES_EPUB \
  --resource-path="manuscript/resources" \
  --output="dist/$BOOK_FILE.epub" \
  --top-level-division=chapter \
  --table-of-contents --toc-depth=2 \
  --standalone \
  --epub-cover-image="media/cover.jpg" \
  --highlight-style "generator/theme.theme" \
  --syntax-definition "generator/syntax/javascript.xml" \
  --syntax-definition "generator/syntax/javascript-react.xml" \
  --syntax-definition "generator/syntax/typescript.xml" \
  --syntax-definition "generator/syntax/typescript-react.xml" \
  --syntax-definition "generator/syntax/pascal.xml" \
  --syntax-definition "generator/syntax/diff.xml" \
  --css "generator/epub.css" \
  --from "$SOURCE_FORMAT" \
  -M date="$VERSION"

# Generate Kindle
echo
echo "[BUILD] Generating Kindle ebook..."

pandoc $CHAPTERS_FILES_EPUB \
  --resource-path="manuscript/resources" \
  --output="dist/$BOOK_FILE-kindle.epub" \
  --top-level-division=chapter \
  --table-of-contents --toc-depth=2 \
  --standalone \
  --epub-cover-image="media/cover-kindle.jpg" \
  --highlight-style "generator/theme.theme" \
  --syntax-definition "generator/syntax/javascript.xml" \
  --syntax-definition "generator/syntax/javascript-react.xml" \
  --syntax-definition "generator/syntax/typescript.xml" \
  --syntax-definition "generator/syntax/typescript-react.xml" \
  --syntax-definition "generator/syntax/pascal.xml" \
  --syntax-definition "generator/syntax/diff.xml" \
  --css "generator/epub.css" \
  --from "$SOURCE_FORMAT" \
  -M date="$VERSION"

echo
echo "[BUILD] 🦆 Done"
echo
