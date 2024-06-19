# TODO: Internal links ({#linting})
# TODO: Remove "Chapter X"
# TODO: LeanPub tips / callouts / alerts (I>, T>)
# TODO: Font sizes
# TODO: Fonts
# TODO: Unicode characters?
# TODO: Rich typo
# TODO: Links in footnotes

BOOK_FILE="washing-code"
BOOK_TITLE="Washing your code: clean code for frontend developers"
CHAPTERS_FILES="generator/settings.md \
	manuscript/010_Header.md \
	manuscript/020_Avoid_loops.md \
  manuscript/030_Avoid_conditions.md"
# TODO: Add the rest of the chapters
COVER="manuscript/resources/images/cover.jpg"
DATE=$(date "+%B %e, %Y")
DIST_DIR=dist

mkdir -p "$DIST_DIR"

# Generate PDF
echo "[BUILD] Generate PDF ebook..."

pandoc $CHAPTERS_FILES \
	--resource-path="manuscript/resources" \
	--output="$DIST_DIR/$BOOK_FILE.pdf" \
  --top-level-division=chapter \
	--table-of-contents --toc-depth=2 \
  --template="generator/eisvogel.latex" \
	--highlight-style "generator/theme.theme" \
  -f gfm \
	-M date="$DATE"

	# -V linkcolor:blue \
	# -V documentclass=report \
	#--number-sections \
	#--top-level-division=chapter \
	# --include-in-header inline_code.tex \

# TODO: Do we need this? Pandoc still can't add a cover?
# pdftk src/assets/black_hat_rust_cover.pdf $DIST_DIR/$BOOK_FILE_content.pdf cat output $DIST_DIR/$BOOK_FILE.pdf
# rm $DIST_DIR/$BOOK_FILE_content.pdf

# pandoc $CHAPTERS_FILES \
# 	--resource-path=src \
# 	--output=$DIST_DIR/$BOOK_FILE.epub \
# 	--table-of-contents --toc-depth=2 \
# 	--top-level-division=chapter \
# 	--number-sections \
# 	--listings \
# 	--standalone \
# 	--epub-cover-image="$COVER" \
# 	--metadata title="$BOOK_FILE" \
# 	--highlight-style theme.json \
# 	--css epub.css \
# 	-M date="$DATE"
