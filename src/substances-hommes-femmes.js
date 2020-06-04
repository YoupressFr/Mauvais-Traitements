import {render, createElement} from 'https://cdn.jsdelivr.net/npm/preact@10.2.1/dist/preact.module.js'
import htm from 'https://cdn.jsdelivr.net/npm/htm@2.2.1/dist/htm.module.js'

import {SEXE_LABEL} from './SEXE_LABEL.js'

const html = htm.bind(createElement);

function mergeHFs(...hfs){
    const result = Object.create(null);
    for(const sexeLabel of Object.values(SEXE_LABEL)){
        result[sexeLabel] = 0;

        for(const hf of hfs){
            result[sexeLabel] += hf[sexeLabel] || 0;
        }
    }

    return result;
}


function HF({homme = 0, femme = 0}){
    const hRatio = homme/(homme+femme)
    const fRatio = femme/(homme+femme)

    return html`<div class="hf">
        <div class="bars">
            <div class="h" style=${ {width: `${hRatio*100}%`} }></div>
            <div class="f" style=${ {width: `${fRatio*100}%`} }></div>
        </div>
        <div class="numbers">
            <span>${(hRatio*100).toFixed(0)}% /  ${(fRatio*100).toFixed(0)}% </span> 
            <span>(${homme} /  ${femme})</span>
        </div>
    </div>`
}

function SubstancesHF(byCatégorie){
    return html`
        ${ [...Object.entries(byCatégorie)].map(([catégorie, bySubstance]) => {

            return html`<section class="catégorie">
                <h1>${catégorie}</h1>
                ${
                    [...Object.entries(bySubstance)].map(([substance, byYear]) => {
                    const bySubstancesHFs = [...Object.values(byYear)].map(byDataset => Object.values(byDataset)).flat()
                    const substanceHF = mergeHFs(...bySubstancesHFs)

                    return html`<section class="substance">
                        <details>
                            <summary>
                                <h1>
                                    <span>${substance}</span>
                                    <${HF} ...${substanceHF}></>
                                </h1>
                            </summary>
                            ${ [...Object.entries(byYear)].map(([year, byDataset]) => {
                                //const yearHF = mergeHFs(...Object.values(byDataset))

                                return html`<section class="year">
                                    <h1>
                                        <span>${year}</span>
                                    </h1>
                                        ${ [...Object.entries(byDataset)].map(([dataset, hf]) => {
                                            return hf.femme > 0 || hf.homme > 0 ? html`<section class="dataset">
                                                <h1>${dataset}</h1>
                                                <${HF} ...${hf}></>
                                            </section>` : undefined
                                        }) }
                                    </section>`
                            })}
                        </details>
                    </section>`
                    })
                }
            </section>`
        })
    }`
}


d3.json('./build/data.json').then(data => {
    console.log('data', data)
    render(html`<${SubstancesHF} ...${data['boitesHFByCatégorie']}></>`, document.querySelector('main'))
})