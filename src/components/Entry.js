import React from 'react';
import Request from './Request';

const getEntryTime = (entry) => {
  return new Date(entry.response.headers[0].value).toLocaleString().substr(11);
};

export default function Entry({
  entry,
  onClick,
  isSelected,
}) {

  return (
    <div className={`entryInner ${isSelected && 'selected'} ${!entry.response.status.toString()[0].startsWith('2') && 'error'}`} onClick={onClick}>
      <div className={`main status-${entry.response && entry.response.status.toString()[0]}`}>
        {entry.url.substring(entry.url.indexOf('sixcrm.com')+10)} <span className="statusCode">Status: {entry.response ? entry.response.status : 'Error'}, Time: {getEntryTime(entry)}</span>
      </div>
      {entry.data && entry.data.map((request, i) => {
        if (request.kind !== 'FragmentDefinition') {
          return <Request key={`request-${i}`} request={request} />;
        }
      })}
      {!entry.data && (
        <p className="error">{entry}</p>
      )}
    </div>
  );
}

Entry.propTypes = {
  entry: React.PropTypes.object.isRequired,
  onClick: React.PropTypes.func.isRequired,
  isSelected: React.PropTypes.bool.isRequired,
};
