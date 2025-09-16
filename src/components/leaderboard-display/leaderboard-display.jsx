

export default function LeaderboardDisplay() {

    return (
        
        /*// TODO : Faire un map pour chaque joueurs dans le leaderboard */

        <div className="leaderboard__table">
                <table>
                  <thead>
                    <tr>
                      <th>Ranking</th>
                      <th>Player Name</th>
                      <th>Games Played</th>
                      <th>Games Won</th>
                      <th>Games First</th>
                      <th>Winrate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td><a href="">Alice</a></td>
                      <td>120</td>
                      <td>85</td>
                      <td>30</td>
                      <td>70.8%</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td><a href="">Bob</a></td>
                      <td>98</td>
                      <td>60</td>
                      <td>22</td>
                      <td>61.2%</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td><a href="">Charlie</a></td>
                      <td>75</td>
                      <td>45</td>
                      <td>15</td>
                      <td>60.0%</td>
                    </tr>
                  </tbody>
                </table>
            </div>
    )
}