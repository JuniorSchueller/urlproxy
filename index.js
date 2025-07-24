const express = require('express');
const fetch = require('node-fetch');
const { URL } = require('url');

const app = express();
const PORT = 3000;

app.use(async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).send('Por favor, forneça a URL na query string, por exemplo: ?url=https://exemplo.com');
    }

    const urlObj = new URL(targetUrl);

    const response = await fetch(targetUrl);
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('text/html')) {
      let html = await response.text();

      html = html.replace(/href="(\/[^"]*)"/g, (match, p1) => {
        return `href="/?url=${encodeURIComponent(new URL(p1, targetUrl).href)}"`;
      });
      html = html.replace(/src="(\/[^"]*)"/g, (match, p1) => {
        return `src="/?url=${encodeURIComponent(new URL(p1, targetUrl).href)}"`;
      });
      html = html.replace(/href="(http[^"]*)"/g, (match, p1) => {
        return `href="/?url=${encodeURIComponent(p1)}"`;
      });
      html = html.replace(/src="(http[^"]*)"/g, (match, p1) => {
        return `src="/?url=${encodeURIComponent(p1)}"`;
      });

      res.set('Content-Type', 'text/html');
      res.send(html);
    } else {
      const buffer = await response.buffer();
      res.set('Content-Type', contentType);
      res.send(buffer);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao proxyar a requisição.');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy rodando na porta ${PORT}`);
});
