const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
//Cantidad de páginas de elespanol scrapeables, esto deberia cambiarse para pillarlo automaticamente sin hardcodearlo
const page_qty = 36


async function main(){
    let enlaces_articulos = await getUrl_articulos();
    let data = await getData(enlaces_articulos)
    console.log(data)
    fs.writeFile("elespanol.json",JSON.stringify(data),function(err){
        if(err) console.log(err)
        console.log("Articulos scrapeados")
    })
}
function getUrl_articulos(){
    return new Promise(async (resolve)=>{
        let enlaces_articulos = []
        for (let index = 0; index < page_qty; index++) {
            const html = await axios.get(`https://www.elespanol.com/opinion/editoriales/${index}/`);
            const $ = await cheerio.load(html.data);
            $('a[id*="news_link"]').each((i,element)=>{
               enlaces_articulos.push('https://www.elespanol.com/'+$(element).attr('href'))
            })
        }
        resolve(enlaces_articulos);
    })
}
function getData(enlaces){
    return new Promise(async(resolve)=>{
        let data = []
        for (let index = 0; index < enlaces.length; index++) {
            const html = await axios.get(enlaces[index])
            const $ = await cheerio.load(html.data);
            let contenido = ""
            $('[id*="paragraph_"]').each((i,content)=>{
                contenido += $(content).text().trim().replace(/  /g,'')
            })
            data.push(
                {titulo: $('.article-header__heading.article-header__heading--s3').text().trim(),fecha:$('.article-header__time-date').text().trim(),contenido:contenido,autor:$('.kicker').text().trim()},
            )
            console.log(data)
            console.log('articulo '+index+' scraped')            
        }
        resolve(data)
    })
}
main();


