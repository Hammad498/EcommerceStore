export const skuGenerator = ({ title, attributes }) => {
  const normalize = (str) =>
    str.toString().trim().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  const shortTitle = normalize(title).slice(0, 9);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  if (attributes && typeof attributes === 'object') {
    const attrPart = Object.values(attributes)
      .map(val => normalize(val).slice(0, 4)) 
      .join('-');
    return `${shortTitle}-${attrPart}-${random}`;
  }

  return `${shortTitle}-${random}`;
};
