
export function getQueryParams(
  queryStringParams: { [key: string]: string; },
  _requiredParams: string[],
  _optionalParams: string[] = []
): { [key: string]: string; } {
  const decodedParams: { [key: string]: string; } = {};
  const requiredParams = _requiredParams.map(param => param.toLowerCase());
  const optionalParams = _optionalParams.map(param => param.toLowerCase());

  for (const [key, value] of Object.entries(queryStringParams ?? {})) {
    decodedParams[key.toLowerCase()] = decodeURIComponent(value);
  }

  const inputParams = Object.keys(decodedParams);
  const correctParams = [...requiredParams, ...optionalParams];
  const validParams = correctParams.filter(correctParam => inputParams.includes(correctParam));
  const missingRequiredParams = requiredParams.filter(requiredParam => !inputParams.includes(requiredParam));
  const invalidParams = inputParams.filter(inputParam => !correctParams.includes(inputParam));

  if (invalidParams.length > 0 || missingRequiredParams.length > 0) {
    throw {
      statusCode: 400,
      error: 'Invalid query parameter input',
      validParams,
      invalidParams,
      missingRequiredParams
    };
  }

  return decodedParams;
}