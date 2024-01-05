import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number, 
  lower_bound: number, 
  trigger_alert: number | undefined,
}


export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]) : Row {
    // we’re able to access serverRespond as an array wherein the
    // first element is stock ABC and the second element is stock DEF
    const priceABC = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price)/2;
    const priceDEF = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price)/2;
    const ratio = priceABC/priceDEF;
    const upperBound = 1 + 0.05;
    const lowerLound = 1 - 0.05;
    // the return value is changed from an array of Row objects to just
    // a single Row object This change explains why we also adjusted the argument
    // we passed to table.update in Graph.tsx earlier so that consistency is
    // preserved
    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      // the latest timestamp is selected
      timestamp: serverResponds[0].timestamp > serverResponds[1].timestamp ? 
        serverResponds[0].timestamp : serverResponds[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerLound, 
      trigger_alert: (ratio > upperBound || ratio < lowerLound) ? ratio : undefined,
    };
  }
}
