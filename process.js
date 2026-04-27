const fs = require('fs');

const csvContent = fs.readFileSync('/atibaia_data.csv', 'utf8');
const lines = csvContent.trim().split('\n').slice(1);

const classesAtibaia = lines.map(line => {
    const parts = line.split(';');
    const escola = parts[2].trim();
    const turma = parts[3].trim();
    const previstos = parseInt(parts[4]);
    const avaliados = parseInt(parts[5]);
    const participacao = parseFloat(parts[6].replace(',', '.'));
    const preTotal = parseFloat(parts[7].replace('%', '').replace(',', '.'));
    const n1 = parseFloat(parts[8].replace('%', '').replace(',', '.'));
    const n2 = parseFloat(parts[9].replace('%', '').replace(',', '.'));
    const n3 = parseFloat(parts[10].replace('%', '').replace(',', '.'));
    const n4 = parseFloat(parts[11].replace('%', '').replace(',', '.'));
    const iniciante = parseFloat(parts[12].replace('%', '').replace(',', '.'));
    const fluente = parseFloat(parts[13].replace('%', '').replace(',', '.'));

    return {
        escola,
        turma,
        previstos,
        avaliados,
        participacao,
        preTotal,
        n1,
        n2,
        n3,
        n4,
        iniciante,
        fluente
    };
});

const aggregatedAtibaia = {};
classesAtibaia.forEach(c => {
    if (!aggregatedAtibaia[c.escola]) {
        aggregatedAtibaia[c.escola] = {
            previstos: 0,
            avaliados: 0,
            n1: 0,
            n2: 0,
            n3: 0,
            n4: 0,
            iniciante: 0,
            fluente: 0
        };
    }
    const school = aggregatedAtibaia[c.escola];
    school.previstos += c.previstos;
    school.avaliados += c.avaliados;
    school.n1 += (c.n1 * c.avaliados) / 100;
    school.n2 += (c.n2 * c.avaliados) / 100;
    school.n3 += (c.n3 * c.avaliados) / 100;
    school.n4 += (c.n4 * c.avaliados) / 100;
    school.iniciante += (c.iniciante * c.avaliados) / 100;
    school.fluente += (c.fluente * c.avaliados) / 100;
});

const rawDataAtibaia = {};
Object.entries(aggregatedAtibaia).forEach(([name, data]) => {
    const part = (data.avaliados / data.previstos * 100).toFixed(0);
    const n1 = (data.n1 / data.avaliados * 100).toFixed(0);
    const n2 = (data.n2 / data.avaliados * 100).toFixed(0);
    const n3 = (data.n3 / data.avaliados * 100).toFixed(0);
    const n4 = (data.n4 / data.avaliados * 100).toFixed(0);
    const iniciante = (data.iniciante / data.avaliados * 100).toFixed(0);
    const fluente = (data.fluente / data.avaliados * 100).toFixed(0);

    rawDataAtibaia[name] = [
        data.previstos,
        data.avaliados,
        parseInt(part),
        parseInt(n1),
        parseInt(n2),
        parseInt(n3),
        parseInt(n4),
        parseInt(iniciante),
        parseInt(fluente)
    ];
});

console.log('--- RAW_DATA_ATIBAIA ---');
console.log(JSON.stringify(rawDataAtibaia, null, 2));

console.log('--- RAW_CLASSES_ATIBAIA ---');
console.log(JSON.stringify(classesAtibaia, null, 2));
