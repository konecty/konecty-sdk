# Uso avançado — Stream, export e demais features

Este documento descreve uso, limites e caveats das funcionalidades avançadas do SDK (stream, export, query, etc.).

## Stream (findStream e streamCount)

**Quando usar:** findStream é indicado para buscas com muitos registros, quando não se deseja carregar todos em memória de uma vez. O CRM envia a resposta em NDJSON (uma linha JSON por registro). streamCount retorna apenas a contagem, útil para paginação ou indicadores.

**Limites conhecidos:** O servidor pode aplicar timeout em streams muito longos. O generator retornado por findStream não deve ser reutilizado após o consumo; para uma nova iteração é necessário chamar findStream novamente.

**Tratamento de erros:** findStream e streamCount rejeitam a Promise em caso de status HTTP 4xx ou 5xx. O consumidor deve usar try/catch ao redor da chamada e da iteração.

**Boas práticas:** Use includeTotal quando precisar do total antes de iterar (ex.: para exibir "X de Y"). Para apenas processar registros em sequência, omitir includeTotal evita que o servidor precise calcular o total.

## Download de arquivo e imagem

**Quando usar:** downloadFile obtém o binário de um arquivo anexo ao registro (path document/code/fieldName/fileName). downloadImage obtém a imagem; com style `thumb` ou `wm` o CRM retorna thumbnail ou versão com marca d'água.

**Limites conhecidos:** Resposta em memória (ArrayBuffer). Para arquivos muito grandes, considerar streaming via fetch direto ou endpoint que suporte Range.

**Tratamento de erros:** Ambos rejeitam a Promise em 4xx/5xx. Use try/catch ao chamar.

## KPI

**Quando usar:** getKpi retorna uma agregação única (count, sum, avg, min, max, countDistinct) sobre os registros que atendem ao filtro. Útil para indicadores e cards.

**Limites conhecidos:** O CRM pode aplicar cache (ETag/304). O SDK não persiste cache; em 304 o método rejeita com mensagem. Para cache no cliente, use o header If-None-Match com o ETag da resposta anterior.

**Tratamento de erros:** Rejeita em 4xx/5xx. kpiConfig é obrigatório; field é obrigatório quando operation não é count.

## Export list

**Quando usar:** exportList retorna o conteúdo do arquivo (CSV, XLSX ou JSON) da lista nomeada (listName) do documento, com filtro/sort/limit/start opcionais. O CRM normaliza xls para xlsx.

**Limites conhecidos:** O namespace pode definir um threshold (ex.: 1000 registros); exportações acima podem exigir permissão exportLarge. 403 em caso de permissão negada; 400 para tipo não suportado.

**Tratamento de erros:** Rejeita em 4xx/5xx. Use try/catch.
