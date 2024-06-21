-- TODO: Add other tips types

function Div (elem)
  -- Tip
  if elem.classes[1] == 'tip' then
    -- Remove the "Tip" text, because we show it in the title
    elem.c[1].content = ''
    return {
      pandoc.RawBlock('latex', '\\begin{tcolorbox}[colframe=tip-info-border!100!white, colback=tip-info-bg!100!white,boxsep=4pt,left=8pt,right=8pt,top=8pt,bottom=8pt,title=\\sffamily\\ding{42} Tip]'),
      elem,
      pandoc.RawBlock('latex', '\\end{tcolorbox}')
    }
  -- Note
  elseif elem.classes[1] == 'note' then
    -- Remove the "Note" text, because we show it in the title
    elem.c[1].content = ''
    return {
      pandoc.RawBlock('latex', '\\begin{tcolorbox}[colframe=tip-info-border!100!white, colback=tip-info-bg!100!white,boxsep=4pt,left=8pt,right=8pt,top=8pt,bottom=8pt,title=\\sffamily\\ding{42} Note]'),
      elem,
      pandoc.RawBlock('latex', '\\end{tcolorbox}')
    }
  -- Warning
  elseif elem.classes[1] == 'warning' then
    -- Remove the "Warning" text, because we show it in the title
    elem.c[1].content = ''
    return {
      pandoc.RawBlock('latex', '\\begin{tcolorbox}[colframe=tip-warning-border!100!white, colback=tip-warning-bg!100!white,boxsep=4pt,left=8pt,right=8pt,top=8pt,bottom=8pt,title=\\sffamily\\ding{42} Warning]'),
      elem,
      pandoc.RawBlock('latex', '\\end{tcolorbox}')
    }
  else
    return elem
  end
end
