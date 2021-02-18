import React, { useState, useEffect } from 'react';
import CSVReader from 'react-csv-reader';
import { Pie } from '@reactchartjs/react-chart.js';


const App = () => {
  const [positionData, setPositionData] = useState({});
  const [scoreData, setScoreData] = useState({});

  useEffect(() => {
    console.log('trigger use effect hook');
  })

  return (
    <div className="App">
      <CSVReader onFileLoaded={
        (data, _) => {
          let transactions = getTransactions(data);
          let positions = toPositions(transactions);
          let positionData = toPositionData(positions);
          setPositionData(positionData);

          let scores = toScores(transactions);
          let scoreData = toScoreData(scores)
          setScoreData(scoreData);
        }} />
      <Pie data={positionData} />
      <Pie data={scoreData} />
    </div>
  )
}

const getTransactions = (csvData) => (
  csvData.filter(r => r[9] && r[9] !== "Trade Date")
    .map(r => (
      {
        "symbol": r[0].trim(),
        "price": parseFloat(r[1]).toFixed(2),
        "date": r[2],
        "tradeDate": r[9],
        "purchasePrice": parseFloat(r[10]).toFixed(2),
        "quantity": parseInt(r[11]),
        "score": parseFloat(r[13]).toFixed(2)
      }))
)

const toPositions = (transactions) => {
  let positions = new Map();
  transactions.forEach(t => {
    let symbol = t.symbol;

    let cur = positions[t.symbol];
    if (!cur) {
      cur = {
        symbol: symbol,
        costBase: 0.0,
        marketValue: 0.0,
        shares: 0
      };
    }
    cur.shares = cur.shares + t.quantity;
    cur.costBase = cur.costBase + (t.quantity * t.purchasePrice);
    cur.marketValue = cur.marketValue + (t.quantity * t.price);
    positions[symbol] = cur;
  });
  return positions;
};

const toScores = (transactions) => {
  let scores = new Map();
  transactions.forEach(t => {
    let score = t.score;

    let cur = scores[score];
    if (!cur) {
      cur = {
        symbol: new Set(),
        costBase: 0.0,
        marketValue: 0.0,
      };
    }
    cur.symbol.add(t.symbol);
    cur.costBase = cur.costBase + (t.quantity * t.purchasePrice);
    cur.marketValue = cur.marketValue + (t.quantity * t.price);
    scores[score] = cur;
  });
  return scores;
};

const toPositionData = (positions) => {
  let values = [];
  for (let symbol in positions) {
    values.push(positions[symbol])
  }
  return {
    labels: values.map(v => v.symbol),
    datasets: [{
      data: values.map(v => v.marketValue),
      backgroundColor: pieColors(values.length, 0.2),
      borderColor: pieColors(values.length, 1.0),
      borderWidth: 1,
    }]
  };
}

const toScoreData = (scores) => {
  let values = [];
  for (let score in scores) {
    values.push(scores[score])
  }
  let sum = values.map(v => v.marketValue).reduce((a, b) => a + b, 0);
  return {
    labels: values.map(v => Array.from(v.symbol).join(',')),
    datasets: [{
      data: values.map(v => Math.round(v.marketValue / sum * 100)),
      backgroundColor: pieColors(values.length, 0.2),
      borderColor: pieColors(values.length, 1.0),
      borderWidth: 1,
    }]
  };
}

const pieColors = (n, a) => {
  let colors = [
    `rgba(255, 99, 132, ${a})`,
    `rgba(54, 162, 235, ${a})`,
    `rgba(255, 206, 86, ${a})`,
    `rgba(75, 192, 192, ${a})`,
    `rgba(153, 102, 255, ${a})`,
    `rgba(255, 159, 64, ${a})`,
  ],
    res = []
  for (let i = 0; i < n - 1; i++) {
    res.push(colors[i % 6]);
  }
  return res;
}
export default App;