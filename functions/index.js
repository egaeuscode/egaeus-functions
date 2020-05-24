const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

function replaceLetter(str){
    return str.replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u');
}
exports.searchAlgorithm = functions.https.onRequest(async (req, res) => {
    if(req.method !== "POST")
        res.status(400).send();
    else {
        let searchSet = new Set();
        let search = req.body.search;
        if (search !== null && search.length > 0) {
            search = replaceLetter(search.toLowerCase());
            let s = (search+" ").split(" ");
            for(let i = 0;i<s.length;i++){
                let word = s[i].replace(/\s/g,'');
                if(word.length > 0 )
                    searchSet.add(word);
            }
        }
        const snapshot = await admin.firestore().collection("algorithms").get();
        let data = [];
        snapshot.forEach(snap => {
            let info = snap.data();
            let words = replaceLetter(info["name"].toLowerCase()).split(" ");
            let ws = false;
            for(let i=0;i<words.length&&!ws;i++){
                if(searchSet.has(words[i])||searchSet.size === 0){
                    ws = true;
                } else {
                    for (let item of searchSet) {
                        if(words[i].includes(item)){
                            ws = true;
                            break;
                        }
                    }
                }
            }
            if (ws) {
                info["id"] = snap.id;
                data.push(info);
            }
        })
        res.status(200).send(data);
    }
});