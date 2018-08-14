import React from 'react';

function Operation({
  operation,
}) {
  const { name } = operation;

  return (
    <div className="operation">
      <p className="name">{`${name}`}</p>
    </div>
  );
}

Operation.propTypes = {
  operation: React.PropTypes.object.isRequired,
};


// TODO: Change this and filename to "Definition"
export default function Request({
  request,
}) {
  const { name, operations } = request;
  return (
    <div className={'request'}>
      <span>{`${name}:`}</span>
      {operations.map(x => (
        <Operation operation={x} />
      ))}
    </div>
  );
}

Request.propTypes = {
  request: React.PropTypes.array.isRequired,
};
