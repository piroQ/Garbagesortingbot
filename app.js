/**
 * multilabel-classification-example.js
 * 
 * 使用例:
 * $ node multilabel-classification-example.js 
 */

// multi-label classification対応のマシンラーニングモジュール limdu をインポート
const limdu = require("limdu");

// ユーザ入力をインタラクティブに受け付けるため
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//
// 篩（ふるい）をセットアップ
// 
const MyWinnow = limdu.classifiers.Winnow.bind(0, {
  retrain_count: 10
});
//
// 分別機能をセットアップ
//
const intentClassifier = new limdu.classifiers.multilabel.BinaryRelevance({
  binaryClassifierType: MyWinnow
});

//
// トレーニング
// NOTE: 2gramに分かち書きしてトレーニングしてみた
// 
intentClassifier.trainBatch([{
  input: create2gramInput("新聞紙、雑誌、ダンボール(段ボール)"),
  output: "ヒモでしばって、資源ゴミとして、出してください。"
},{
   input: create2gramInput("空きびん、空き瓶、空きビン、空き缶、ペットボトル"),
   output: " 1.フタ・栓やラベルのあるものは取り除いてください。\n 2.中を洗ってから、つぶせるものは軽くつぶしてください、洗っても油分などの汚れが落ちないものは、ごみとして出してください。\n 3.集積所に設置されたコンテナに分別して入れてください。（びんは黄色、かんは青色、ペットボトルは緑色のコンテナ）\n 4.ビニール袋などから出し、静かに入れてください。"
},{
    
  input: create2gramInput("生ごみ、アルミホイル、貝がら、衣類、布類 汚れた紙など 木製品・木材、製品プラスチック、ゴム・革・ビニール製品、生ゴミ、プラスチック製品"),
  output: "「燃やせるごみ」としてお出しください（生ごみ、アルミホイル、貝がら、衣類、布類 汚れた紙など 木製品・木材、製品プラスチック、ゴム・革・ビニール製品など）"
}, {
  input: create2gramInput("食器、割れたLED、カイロ、傘、小型家電、小型電化製品"),
  output: "ガラス片、割れた食器など危険なものは、厚手の紙などに、包んで、「キケン」と表示してください。"
}, {
  input: create2gramInput("やかん、油の缶、刃物"),
  output: "鋭利なものは「キケン」と表示してください"
},{
   input: create2gramInput("LED、蛍光灯"),
   output: "割れないように購入したときの紙ケースに入れるか、厚手の紙に包んで出してください。"
},{
   input: create2gramInput("電池"),
   output: "ボタン電池、充電式電池については出来るだけ回収ボックスのある回収協力店へお持ちください。発火や破裂の恐れがあるので、両極をセロハンテープで覆う等、絶縁してから出してください。 "
},{
   input: create2gramInput("水銀製品、水銀体温計、水銀血圧計、アナログ温度計、水銀温度計"),
   output: "割れないように、厚手の紙に包んで出してください。"
}]);

//
// ユーザからの入力を受付
//
quest();

function quest() {
  rl.question('ごみの出し方をアドバイスします。どんなごみを捨てますか？(例: ペットボトル) ', (answer) => {
    //
    // 分別実施
    // NOTE: ユーザの入力値を2gramに分かち書きして投入
    // 
    const input2gram = create2gramInput(answer);
    const result = intentClassifier.classify(input2gram);
    if (result.length >= 1) {
      console.log("回答: " + result[0]); // e.g."「資源ごみ」としてお出しください（空き缶、空き瓶、ペットボトル、新聞紙、雑誌、ダンボール(段ボール)など）"
    } else {
      console.log(`回答: すみません、"${answer}" の出し方は分かりません。`);
    }
    // rl.close();
    quest(); // 再帰質問
  });
}
/**
 * 入力された文章を2gram分かち書きし、
 *  { "xx": 1, ... } なフォーマットのオブジェクトを返します。
 *  
 * @param  {String} e.g. "空き缶、空き瓶、ペットボトル、新聞紙、雑誌、ダンボール(段ボール)"
 * @return {Object} e.g. { '空き': 1,
 *  'き缶': 1,
 *  'き瓶': 1,
 *  'ペッ': 1,
 *  'ット': 1,
 *  'トボ': 1,
 *  'ボト': 1,
 *  'トル': 1,
 *  '新聞': 1,
 *  '聞紙': 1,
 *  '雑誌': 1,
 *  'ダン': 1,
 *  'ンボ': 1,
 *  'ボー': 1,
 *  'ール': 1,
 *  '段ボ': 1 }
 */
function create2gramInput(s) {
  const ret = {};
  const arr = s.split("");
  for (let len = arr.length, i = 0; i < len; i++) {
    const c0 = arr[i]; // 2gramの1文字目
    const c1 = arr[i + 1]; // 2gramの2文字目
    // 1文字目or2文字目のどちらかに記号や区切り文字が入ってれば無視
    if (shouldIgnore(c0) || shouldIgnore(c1)) continue;
    ret[c0 + c1] = 1;
  }
  return ret;  
  // 記号や区切りチェック
  function shouldIgnore(c) {
    if (!c) return true;
    return / |　|,|、|\.|。|・|:|：|\(|\)/.test(c);
  }
}

