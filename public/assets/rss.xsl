<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:dc="http://purl.org/dc/elements/1.1/">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title><xsl:value-of select="rss/channel/title"/> — Flux RSS</title>
  <style>
    body { margin:0; background:#f4f1ec; font-family:'Montserrat',Arial,sans-serif; color:#1a1918; }
    header { background:#1a1918; color:#f4f1ec; padding:28px 20px; }
    header .in { max-width:760px; margin:auto; }
    h1 { margin:0 0 6px; font-size:1.5rem; }
    h1 b { color:#de5011; }
    header p { margin:0; color:#8f8a83; font-size:.85rem; }
    .note { max-width:760px; margin:20px auto; padding:14px 18px; background:#fff; border-left:4px solid #de5011; font-size:.85rem; line-height:1.5; }
    .note code { background:#eee; padding:1px 5px; border-radius:4px; }
    main { max-width:760px; margin:0 auto 40px; padding:0 20px; }
    article { background:#fff; border-radius:10px; padding:18px 22px; margin:14px 0; box-shadow:0 1px 4px rgba(0,0,0,.06); }
    article h2 { margin:0 0 6px; font-size:1.05rem; }
    article h2 a { color:#1a1918; text-decoration:none; }
    article h2 a:hover { color:#de5011; }
    .meta { font-size:.75rem; color:#8f8a83; margin-bottom:8px; }
    .meta b { color:#de5011; }
    article p { margin:0; font-size:.88rem; line-height:1.55; color:#46413c; }
  </style>
</head>
<body>
  <header><div class="in">
    <h1><b>Afriqu</b>infos — Flux RSS</h1>
    <p><xsl:value-of select="rss/channel/description"/></p>
  </div></header>
  <div class="note">
    Ceci est un <strong>flux RSS</strong>, destiné aux agrégateurs d'actualités.
    Copiez l'adresse <code><xsl:value-of select="rss/channel/atom:link/@href" xmlns:atom="http://www.w3.org/2005/Atom"/></code>
    dans votre lecteur RSS (Feedly, Inoreader, NetNewsWire…) pour suivre Afriquinfos.
  </div>
  <main>
    <xsl:for-each select="rss/channel/item">
      <article>
        <h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
        <div class="meta"><b><xsl:value-of select="category"/></b> · <xsl:value-of select="dc:creator"/> · <xsl:value-of select="pubDate"/></div>
        <p><xsl:value-of select="description"/></p>
      </article>
    </xsl:for-each>
  </main>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
