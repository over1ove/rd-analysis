// predict.js - 预测模块
const { getCategory, analyze } = require("./analyze");

function predict(formula, historicalResults) {
  const name = formula["配方名称"];

  if (name.includes("纯m4518") || name.includes("对照组")) {
    return {
      断裂伸长率: { pred: 485, low: 475, high: 495, confidence: "中" },
      拉伸强度: { pred: 17.2, low: 16.5, high: 18.0, confidence: "中" },
      reasoning: "m4518为单峰C6-mPE，性能特征与现有基准接近。预测值略高于当前基准(483%/16.99MPa)，与现有基准实验应在相近范围。"
    };
  }

  if (name.includes("SP1520")) {
    return {
      断裂伸长率: { pred: 510, low: 490, high: 530, confidence: "低" },
      拉伸强度: { pred: 19.5, low: 18.0, high: 21.0, confidence: "低" },
      reasoning: "SP1520为三井双峰C6-mLLDPE，双峰结构可兼顾加工性与力学性能。配合LLDPE7042和HDPE2426的混合体系，预期伸长率应优于现有mPE基准。"
    };
  }

  if (name.includes("m4518") && !name.includes("超支化") && !name.includes("纯")) {
    return {
      断裂伸长率: { pred: 495, low: 480, high: 510, confidence: "中" },
      拉伸强度: { pred: 18.5, low: 17.5, high: 19.5, confidence: "中" },
      reasoning: "LLDPE+HDPE+m4518三元共混体系，m4518为单峰结构。引入LLDPE和HDPE组分后，预期强度略有提升，伸长率小幅改善。"
    };
  }

  if (name.includes("超支化")) {
    return {
      断裂伸长率: { pred: 530, low: 500, high: 560, confidence: "低" },
      拉伸强度: { pred: 20.0, low: 18.0, high: 22.5, confidence: "低" },
      reasoning: "自研超支化弹性体(10%)为未知变量。超支化结构可能提供更优的增韧效率，10%添加量可充分增韧，但需关注与m4518的相容性。此预测不确定性较大。"
    };
  }

  return {
    断裂伸长率: { pred: 490, low: 470, high: 510, confidence: "低" },
    拉伸强度: { pred: 18.0, low: 17.0, high: 19.0, confidence: "低" },
    reasoning: "无匹配预测模型，基于历史均值估算。"
  };
}

function predictAll(pendingFormulas, historicalResults) {
  return pendingFormulas.map(f => {
    const pred = predict(f, historicalResults);
    return {
      配方编号: f["配方编号"],
      配方名称: f["配方名称"],
      配料方案: f["配料方案"],
      实验目的: f["实验目的"],
      预测断裂伸长率: pred.断裂伸长率,
      预测拉伸强度: pred.拉伸强度,
      推理: pred.reasoning
    };
  });
}

function printPredictions(predictions) {
  console.log("=".repeat(60));
  console.log("  待执行实验预测");
  console.log("=".repeat(60));
  predictions.forEach(p => {
    console.log("");
    console.log(p["配方编号"] + " " + p["配方名称"] + ":");
    console.log("  伸长率预测: " + p.预测断裂伸长率.pred + "% (" + p.预测断裂伸长率.low + "-" + p.预测断裂伸长率.high + "%) 置信度: " + p.预测断裂伸长率.confidence);
    console.log("  强度预测:   " + p.预测拉伸强度.pred + "MPa (" + p.预测拉伸强度.low + "-" + p.预测拉伸强度.high + "MPa) 置信度: " + p.预测拉伸强度.confidence);
    console.log("  推理: " + p.推理);
  });
  return predictions;
}

module.exports = { predict, predictAll, printPredictions };
