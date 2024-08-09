const main = async () => {
  const search = document.getElementById("search");
  const display = document.getElementById("display");

  const res = await fetch("/data/main.json");
  const data = await res.json();

  const docs = data["bible"]
    .map((book) =>
      book["chapters"].map((ch) =>
        ch["verses"].map((v) => {
          return {
            text: v["text"],
            ...v,
            chapter: ch["chapter"],
            book: book["book"],
          };
        })
      )
    )
    .flat(2);

  const haystack = docs.map(
    (d) => `${d["text"]} | ${d["book"]} ${d["chapter"]}:${d["verse"]}`
  );
  const u = new uFuzzy({
    intraMode: 1,
    intraSub: 1,
    intraTrn: 1,
    intraDel: 1,
    intraIns: 1,
  });
  console.log(docs);

  const update = async (query, mx=100) => {
    if(query.length == 0){
        display.innerHTML = ""
        return
    }

    const idxs = u.filter(haystack, query);
    const info = u.info(idxs, haystack, query);
    const order = u.sort(info, haystack, query);
    console.log(order, info, idxs);
    display.innerHTML = query;

    display.innerHTML = order.slice(0,mx).map((o) => {
      const x = docs[info.idx[o]];
      let h = uFuzzy.highlight(x["text"], info.ranges[o]).split('')
      let c = 0;
      for(let i = 0; i < h.length; i++){
        if(h[i] == '|' && h[i+1] == '|'){
            let ch = c % 2 == 0 ? '%' : '#'
            h[i] = ch
            h[i+1] = ch
            i++
            c++
        }
      }
      h = h.join('').replace(/%%/g, "<span class='heading'>").replace(/##/g, "</span>").split('')
      c = 0
      for(let i = 0; i < h.length; i++){
        if(h[i] == '_'){
            h[i] = c % 2 == 0 ? '%' : '#'
            i++
            c++
        }
      }

      h = h.join('').replace(/%/g, "<i>").replace(/#/g, "</i>").replace(/(?<=\w)"(?=\w)/g, "'")

      c = 0
      for(ind = h.indexOf("||"); ind >= 0; ind = h.indexOf("||")){
        h.replaceAt(ind, c % 2 == 0 ? '%' : '#')
        h.replaceAt(ind+1, c % 2 == 0 ? '%' : '#')
      }
      return `<div class="result"><p class="ref">${x["book"]} ${x["chapter"]}:${x["verse"]}</p><p class="content">${h}</p></div>`;
    }).join('');
  };

  search.addEventListener("input", (e) => {
    console.log("hit event", e.target.value);
    update(e.target.value);
  });
};

const query = (s) => {
  console.log("query", s);
};

document.addEventListener("DOMContentLoaded", main);
