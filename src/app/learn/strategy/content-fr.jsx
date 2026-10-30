import Link from "next/link.js";

// Version française du guide de stratégie (la version anglaise est dans page.jsx)
export default function StrategyContentFr() {
  return (
    <>
      <h1>Guide de stratégie</h1>
      <div className="divider"></div>

      <article>
        <p>
          Tous les joueurs veulent progresser et gagner plus de pots, mais tout le monde n&apos;a pas le temps,
          la patience ou l&apos;envie de réfléchir en profondeur à la stratégie.
        </p>
        <p>
          C&apos;est pourquoi nous avons résumé sur une seule page les grands principes de la stratégie au poker,
          pour que tu puisses <strong>apprendre les bases d&apos;un jeu solide sans te sentir submergé</strong>.
          Nous nous concentrons sur le <strong>Texas Hold&apos;em</strong>, mais beaucoup de ces principes valent aussi
          pour les autres variantes. Voyons les quatre points clés.
        </p>
      </article>

      <article>
        <h2>Tes cartes de départ comptent</h2>
        <p>La question la plus importante que tu te poseras dans n&apos;importe quel pot est probablement :</p>
        <p><i>« Dois-je jouer cette main ? »</i></p>
        <p>
          Peu importe la variante, du <strong>Texas Hold&apos;em</strong> à l&apos;<strong>Omaha</strong>,
          en passant par le <strong>Royal Poker</strong>, décider de jouer ou non une main pèse lourd sur tes résultats.
          Pour faire simple, <strong>plus tu as souvent de meilleures cartes que tes adversaires, plus tu gagnes de pots</strong> à long terme.
        </p>
        <p>
          La bonne nouvelle, c&apos;est que se coucher ne coûte rien, mais comment savoir quelles mains valent la peine d&apos;être jouées ?
          Il y a toujours des exceptions, mais en général <strong>les mains les plus jouables au Hold&apos;em</strong>
          appartiennent aux groupes suivants :
        </p>

        <h3>Les paires</h3>
        <p>
          Quand tu démarres avec une paire déjà formée, tu es statistiquement devant toute main qui n&apos;a pas une paire plus haute.
          <strong> Les paires premium</strong> comme les as et les rois se jouent généralement de façon agressive,
          tandis que <strong>les petites paires</strong> valent surtout si tu peux voir un flop pas cher et avoir une chance de faire un brelan (set).
        </p>

        <h3>Les as et les hautes cartes</h3>
        <p>
          Les mains avec <strong>des hautes cartes non appariées</strong> comme AR ou AD suffisent parfois pour gagner un pot sans s&apos;améliorer,
          surtout à peu de joueurs, et si elles touchent le flop, tu as probablement une main solide.
          En revanche, si elles ne s&apos;améliorent pas et que tes adversaires montrent de la force,
          il faudra peut-être coucher ces jolies mains.
        </p>

        <h3>Les connecteurs</h3>
        <p>
          Des mains comme 10-V, 7-8 ou 5-6 peuvent être rentables si tu vois un flop avec
          <strong> sans engager beaucoup de jetons</strong>, surtout si elles sont assorties.
          Pouvoir faire une quinte ou une couleur, combiné au fait que peu d&apos;adversaires s&apos;attendent à te voir avec de telles cartes,
          peut te faire gagner de très gros pots.
        </p>
      </article>

      <article>
        <h2>La position, c&apos;est le pouvoir</h2>
        <p>
          On peut considérer que les joueurs à une table de poker sont assis dans l&apos;une de trois positions : début, milieu et fin.
          Cela se mesure <strong>par rapport à la position du donneur</strong>, qui est le dernier à parler sur la plupart des tours de mise
          et qui est donc la toute dernière des positions tardives, tandis que la petite blind – première à parler sur la plupart des tours – est la position la plus précoce.
        </p>
        <p>
          Un joueur en position tardive a <strong>un avantage naturel sur tous les joueurs qui parlent avant lui</strong>,
          car il prend ses décisions après avoir vu ce que ses adversaires ont choisi de faire.
          Cet avantage est si important que la position du donneur change après chaque main,
          pour que l&apos;avantage de la position tardive tourne et que tous les joueurs puissent en profiter.
        </p>
        <p>Et comment en profiter ? En jouant plus de mains.</p>
        <p>
          Avec moins de risques de se faire relancer, et en sachant comment tes adversaires ont réagi quand ils pouvaient miser,
          la position tardive te permet souvent de <strong>
            jouer des <Link href="/learn/hands">mains plus faibles</Link> que tu ne jouerais pas depuis une position précoce
          </strong>.
          Cette stratégie s&apos;appelle <strong>« élargir son range »</strong>,
          et elle peut t&apos;aider à gagner plus de pots tout en gardant une image imprévisible à la table.
        </p>
      </article>

      <article>
        <h2>Connais tes cotes et tes outs</h2>
        <p>
          Que tu sois un joueur de cash game qui veut améliorer ses gains,
          ou que tu peaufines ta stratégie de sit &apos;n&apos; go pour augmenter ton ROI en tournoi,
          <strong> comprendre les cotes du pot</strong> est une arme précieuse.
        </p>
        <p>
          Cela intervient surtout quand tu penses être battu par une main plus forte,
          mais que tu gagneras le pot si une certaine carte tombe. Imagine que ton adversaire mise,
          et que tu te poses cette question classique :
        </p>
        <p><i>« Dois-je suivre, en espérant toucher la carte qui me fera gagner le pot ? »</i></p>
        <p>
          Il existe en fait une façon assez simple d&apos;y répondre,
          et même si elle demande un peu de calcul, pas besoin d&apos;être un génie !
        </p>
        <p>
          D&apos;abord, compte <strong>le nombre de cartes qui, selon toi, te feront gagner le pot</strong>.
          Disons qu&apos;au turn tu as quatre carreaux, qu&apos;il t&apos;en faut un cinquième pour faire une couleur,
          et que sinon tu es sûr de perdre le pot.
          Il y a 13 carreaux dans le jeu, dont tu en as 4, donc il en reste 9 à toucher.
          Ces 9 cartes s&apos;appellent tes <strong>« outs »</strong>.
        </p>
        <p>
          Ensuite, calcule <strong>le nombre de cartes inconnues restant dans le paquet</strong>.
          Au Hold&apos;em, au turn, tu vois 6 cartes (tes deux cartes privées plus les quatre cartes communes),
          ce qui laisse 46 cartes inconnues dans le paquet.
        </p>
        <p>
          Sur ces 46 cartes, 9 sont tes outs et te feront gagner la main, ce qui en laisse 37 qui ne le feront pas.
          Le rapport entre les « mauvaises » et les « bonnes » cartes est ici de <strong>37 contre 9</strong>,
          soit environ <strong>4 contre 1</strong>. Cela signifie que tu as environ 20 % de chances de toucher ta carte gagnante.
        </p>
        <p>
          Alors, faut-il suivre la mise ? C&apos;est là qu&apos;interviennent les <strong>« cotes du pot »</strong> –
          <strong>le rapport entre les jetons dans le pot et les jetons que tu dois mettre pour suivre</strong>.
          Si ce rapport est supérieur au rapport « mauvaises » contre « bonnes » cartes ci-dessus, tu dois suivre. S&apos;il est inférieur, tu dois te coucher.
        </p>
        <p>
          Avec 4 carreaux en main et 9 outs qui te feraient gagner le pot, imagine que ton adversaire mise 100 jetons dans un pot qui en contient déjà 100.
          Le rapport entre le pot (200 jetons) et ce que tu dois payer (100 jetons) n&apos;est que de <strong>2 contre 1</strong> –
          inférieur aux <strong>4 contre 1</strong> que tu as de toucher ton out et de gagner le pot. C&apos;est clairement un <strong>fold</strong>.
        </p>
        <p>
          Imagine maintenant la même situation, mais avec un pot de 4 900 jetons et une mise de 100 jetons de ton adversaire.
          Le rapport entre le pot (5 000) et ce que tu dois payer (100 jetons) est maintenant de <strong>50 contre 1</strong> –
          bien supérieur aux <strong>4 contre 1</strong> que tu as de gagner. C&apos;est clairement un <strong>call</strong> !
        </p>
      </article>

      <article>
        <h2>Lire les joueurs et leurs ranges</h2>
        <p>
          Beaucoup de guides de stratégie d&apos;autrefois insistaient sur le langage corporel de l&apos;adversaire,
          en cherchant des tells comme des mains qui tremblent ou des regards fuyants pour deviner s&apos;il bluffe ou non.
        </p>
        <p>
          Mais cela ne veut pas dire qu&apos;il est impossible de lire tes adversaires. Observe comment ils jouent
          quand tu n&apos;es pas dans la main, et tu vas vite <strong>remarquer des schémas</strong>.
        </p>
        <p>
          Un joueur a-t-il montré <strong>plusieurs mains faibles</strong>, payé pour rester avec <strong>des tirages improbables</strong>,
          et fait de gros calls sans grosse main ?
          Joue tes bonnes mains plus agressivement contre ce type de joueur et tu seras probablement payé,
          mais méfie-toi si tu veux le bluffer – il peut très bien décider de suivre sans bonne main… et te battre !
        </p>
        <p>
          À l&apos;autre bout du spectre, tu peux repérer des joueurs qui <strong>entrent rarement dans un pot</strong>,
          qui semblent attendre <strong>uniquement de bonnes mains</strong>, et qui n&apos;appuient que quand ils sont sûrs d&apos;avoir une main imbattable.
          Face à eux, tu dois jouer plus de mains, plus agressivement,
          car tu peux probablement leur faire lâcher tout sauf leurs toutes meilleures mains.
        </p>
        <p>
          En classant ainsi les joueurs, tu te feras vite une idée du type de mains que chacun est prêt à jouer,
          et de la façon dont il les joue. Cela t&apos;aidera à placer ton adversaire sur un <strong>« range »</strong> –
          un ensemble de combinaisons de cartes avec lesquelles il jouerait comme il l&apos;a fait.
        </p>
        <p>
          Plus le joueur est loose, plus son range est large ; donc si un joueur très tight relance depuis une position précoce,
          tu peux être assez certain qu&apos;il a une main forte.
          De même, les joueurs qui limpent avant le flop ont rarement des mains ultra-fortes avec lesquelles ils relanceraient d&apos;habitude pour se protéger.
        </p>
      </article>

      <article>
        <h2>Développe ta propre stratégie</h2>
        <p>
          L&apos;une des belles choses au poker, c&apos;est que chacun y joue différemment,
          alors prends les points ci-dessus comme des lignes directrices – tu croiseras toujours des joueurs qui te surprendront
          avec des approches peu orthodoxes ou des tactiques inhabituelles.
          Les tournois, les formats, les variantes et les joueurs changent d&apos;une partie à l&apos;autre, et le contexte compte toujours.
        </p>
        <p>
          Cela dit, si tu retiens ces points au fil de ton expérience à table,
          tu seras bien préparé pour <strong>progresser</strong> et voir tes <strong>résultats s&apos;améliorer</strong>.
        </p>
        <p>
          Utilise ces conseils comme fondations de ta propre stratégie, et va tout casser à table !
        </p>
      </article>
    </>
  );
}
