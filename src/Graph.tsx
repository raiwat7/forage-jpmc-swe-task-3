import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      // we added price_abc and price_def because these are necessary to calculate the
      // ratio. We won’t be configuring the graph to show them.
      price_abc: 'float',
      price_def: 'float',
      // Since we don’t want to distinguish between two stocks now, preferring
      // to track their ratios, we added the ratio field.
      ratio: 'float',
      // Since we’re tracking all of this with respect to time, we need
      // a timestamp field
      timestamp: 'date',
      // Since we also wanted to track upper_bound, lower_bound, and the moment
      // when these bounds are crossed i.e. trigger_alert, we’ve added corresponding
      // fields.
      upper_bound: 'float', 
      lower_bound: 'float', 
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      // ‘column-pivots’ used to exist and was what allowed us to distinguish / split
      // stock ABC with DEF back in task 2. We removed this because we’re
      // concerned about the ratios between the two stocks and not their separate
      // prices
      // elem.setAttribute('column-pivots', '["stock"]');
      elem.setAttribute('row-pivots', '["timestamp"]');
      // ‘columns’ is what allows us to focus on a particular part of a datapoint’s
      // data along the y-axis. Without this, the graph would plot all the fields
      // and values of each datapoint, yielding significant noise. 
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg', 
        lower_bound: 'avg', 
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      // this.table.update(
      //   DataManipulator.generateRow(this.props.data),
      // );
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

export default Graph;
