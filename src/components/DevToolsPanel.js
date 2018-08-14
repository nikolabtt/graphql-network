import React from 'react';
import Entry from './Entry';
import LongInformation from './LongInformation';

import {
  isGraphQL,
  parseEntry,
} from '../lib/utils';

export default class DevToolsPanel extends React.Component {
  static propTypes = {
    requestFinished: React.PropTypes.object.isRequired,
    getHAR: React.PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      entryOpen: false,
      openIndex: null,
    };
  }

  parseLogToState = (log) => {
    if (!isGraphQL(log)) return null;
    return parseEntry(log)
      .then(data => {
        this.setState({
          data: [...this.state.data, data],
        });
      });
  };

  clearLogs = () => {
    this.setState({
      data: []
    })
  };

  requestHandler = (request) => {
    this.parseLogToState(request);
  };

  setEntry = (entry, i) => this.setState({ entryOpen: entry, openIndex: i });
  onRequestClose = () => this.setState({ entryOpen: false, openIndex: null });

  componentDidMount() {
    this.props.requestFinished.addListener(this.requestHandler);
  }

  render() {
    const { data, entryOpen } = this.state;
    return (
      <div className="devToolsWrapper">
        <div className="toolbar">
          <span className="clear" onClick={() => this.clearLogs()}>clear</span>
        </div>
        <div className={`entryWrapper ${entryOpen && 'shortEntryWrapper'}`}>
        {data.map((entry, i) => {
          return (
            <div>
              <Entry
                key={`entry-${i}`}
                onClick={() => this.setEntry(entry, i)}
                entry={entry}
                isSelected={entryOpen && entry.id === entryOpen.id}
              />

              <div className={`displayAreaWrapper ${entryOpen && entry.id === entryOpen.id && 'longDisplayAreaWrapper'}`}>
                {entryOpen && entry.id === entryOpen.id && (
                  <LongInformation
                    entry={entryOpen}
                    onRequestClose={this.onRequestClose}
                  />
                )}
              </div>

            </div>
          );
        })}
        </div>
      </div>
    );
  }
}
