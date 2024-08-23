const main = async () => {
  const search = document.getElementById("search");
  const searchStatus = document.getElementById("search-status")
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

  let idxs, info, order, results;
  const expandText = ['Chapter', 'Verse']

  const toggle = (ind) => {
    const [x, node] = results[ind]
    if(results[ind][0]['expanded']) {
      results[ind][0]['expanded'] = false
      results[ind][1].setAttribute('class', 'result single')
      results[ind][1].querySelector(".ref span").innerHTML = `${x["book"]} ${x["chapter"]}:${x["verse"]}`
      results[ind][1].querySelector('.expand').innerHTML = expandText[0]
      results[ind][1].querySelector(".content").innerHTML = sanitize(x["text"], ranges=info.ranges[order[ind]])
    } else {
      results[ind][0]['expanded'] = true
      results[ind][1].setAttribute('class', 'result expanded')
      results[ind][1].querySelector(".ref span").innerHTML = `${x["book"]} ${x["chapter"]}`
      results[ind][1].querySelector('.expand').innerHTML = expandText[1]
      const ch = data["bible"].find((v) => v["book"] == x["book"])["chapters"].find((v) => v["chapter"] == x["chapter"])
      const vs = ch["verses"].map((v) => (v["verse"] == 1 ? "" : `<span class="vmark">${v["verse"]}</span>`) + sanitize(v["text"], ranges=(v["verse"] == x["verse"] ? info.ranges[order[ind]] : undefined))).join("")
      results[ind][1].querySelector(".content").innerHTML = vs;
    }
  };

  const result = (x, ind, ranges=undefined, full=false) => {
    const h = sanitize(x["text"], ranges=ranges)
    
    const btn = document.createElement("button");
    btn.setAttribute("class", "expand");
    btn.innerHTML = !full ? expandText[0] : expandText[1];
    btn.onclick = (e) => toggle(ind);

    const p = document.createElement("p");
    p.setAttribute("class", "ref");
    p.innerHTML = !full ? `<span>${x["book"]} ${x["chapter"]}:${x["verse"]}</span>` : `<span>${x["book"]} ${x["chapter"]}</span>`;
    p.appendChild(btn);
    const cont = document.createElement("p");
    cont.setAttribute("class", "content");
    cont.innerHTML = `${h}`;

    const div = document.createElement("div");
    div.setAttribute("class", "result single");
    div.setAttribute("id", `result-${ind}`);
    div.appendChild(p);
    div.appendChild(cont);

    return div;
  };

  const sanitize = (text, ranges = undefined) => {
    let h = (ranges ? uFuzzy.highlight(text, ranges) : text);
    h = h.replace(/<\/mark>\s+<mark>/g, " ").split("")

    let c = 0;
    for (let i = 0; i < h.length; i++) {
      if (h[i] == "|" && h[i + 1] == "|") {
        let ch = c % 2 == 0 ? "%" : "#";
        h[i] = ch;
        h[i + 1] = ch;
        i++;
        c++;
      }
    }
    h = h
      .join("")
      .replace(/%%/g, "<span class='heading'>")
      .replace(/##/g, "</span>")
      .split("");
    c = 0;
    for (let i = 0; i < h.length; i++) {
      if (h[i] == "_") {
        h[i] = c % 2 == 0 ? "%" : "#";
        i++;
        c++;
      }
    }

    h = h
      .join("")
      .replace(/%/g, "<i>")
      .replace(/#/g, "</i>")
      .replace(/(?<=\w)"(?=\w)/g, "'");

    h = h.replace(/\\/g, "").replace(/\[\^\w\]/g, ""); 
    return h;
  };

  const update = async (query, mx = 100) => {
    const d1 = new Date();

    const url = new URL(window.location)
    url.searchParams.set("search", query)
    history.pushState(null, '', url)

    if (query.length == 0) {
      display.innerHTML = "";
      searchStatus.innerHTML = ""
      return;
    }    

    idxs = u.filter(haystack, query);
    info = u.info(idxs, haystack, query);
    order = u.sort(info, haystack, query);

    results = order.slice(0, mx).map((o, i) => {
      const x = docs[info.idx[o]];
      return [x, result(x, i, ranges=info.ranges[o])];
    });

    // while(display.lastChild) display.removeChild(display.lastChild)
    display.replaceChildren();
    for (let res of results) display.appendChild(res[1]);
    
    const d2 = new Date();
    searchStatus.innerHTML = `Found ${results.length} / ${order.length} results <span class="dt">(${d2-d1} ms)</span>`
  };

  const wSearch = new URLSearchParams(window.location.search).get('search');
  if(wSearch && wSearch.length > 0) {
    search.value = wSearch
    update(wSearch);
  }

  search.addEventListener("input", (e) => {
    update(e.target.value);
  });
};

document.addEventListener("DOMContentLoaded", main);
