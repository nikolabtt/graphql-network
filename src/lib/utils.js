import { parse } from 'graphql';
import Promise from 'bluebird';

function getValue(value) {
  if (value.kind === 'ListValue') {
    return value.values.map(x => getValue(x));
  } else if (value.kind === 'Variable') {
    return `$${value.name.value}`;
  } else if (value.kind === 'ObjectValue') {
    const out = {};
    value.fields.forEach(field => {
      out[field.name.value] = getValue(field.value);
    });
    return JSON.stringify(out);
  } else {
    return value.value;
  }
}

function parseArguments(arr) {
  return arr.filter(x => x.name).map(x => ({
    name: x.name.value,
    value: getValue(x.value),
    kind: x.value.kind,
  }));
}

function parseFields(arr) {
  return arr.selections.map(x => parseOperation(x));
}

function getName(definition) {
  if (definition.kind === 'InlineFragment') {
    return `InlineFragment if ${definition.typeCondition.name.value}`;
  } else if (definition.alias && definition.name) {
    return `${definition.alias.value}: ${definition.name.value}`;
  } else if (definition.name) {
    return definition.name.value;
  } else {
    return 'Anonymous';
  }
}

function parseOperation(definition) {
  return {
    kind: definition.kind,
    name: getName(definition),
    params: definition.arguments ? parseArguments(definition.arguments) : null,
    fields: definition.selectionSet ? parseFields(definition.selectionSet) : null,
  };
}

function internalParse(requestData) {
  const { definitions } = requestData;
  return definitions.map(definition => {
    return {
      name: definition.name ? definition.name.value : (definition.operation || 'request'),
      kind: definition.kind,
      operations: definition.selectionSet.selections.map(operation => {
        return {
          ...parseOperation(operation),
          type: definition.operation || operation.kind,
        };
      }),
    };
  });
}

function containsInUrl(entry, paths) {
  return paths.some((path) => {
    return entry.request.url.indexOf(path) !== -1;
  })
}

export function isGraphQL(entry) {
  try {
    return containsInUrl(entry, ['/graph/','/customergraph/','/publicgraph/']) && entry.request.method === 'POST';
  } catch (e) {
    return false;
  }
}

export function parseEntry(entry) {
  let data;
  let queryVariables;

  data = entry.request.postData.text;

  const query = data;
  let requestData,
    rawParse;

  try {
    rawParse = parse(query);
  } catch (e) {
    return Promise.resolve(`GraphQL Error Parsing: ${query}. Message ${e.message}. Stack: ${e.stack}`);
  }

  try {
    requestData = internalParse(rawParse);
  } catch (e) {
    return Promise.resolve(`Internal Error Parsing: ${query}. Message: ${e.message}. Stack: ${e.stack}`);
  }

  const fragments = requestData
    .filter(x => x.kind === 'FragmentDefinition');

  return new Promise(resolve => {
    entry.getContent(responseBody => {
      resolve({
        responseBody,
        queryVariables,
        fragments,
        id: `${Date.now() + Math.random()}`,
        url: entry.request.url,
        bareQuery: data,
        data: requestData,
        response: entry.response,
        rawParse: JSON.stringify(rawParse),
      });
    });
  });
}
