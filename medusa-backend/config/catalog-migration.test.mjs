import test from 'node:test';
import assert from 'node:assert/strict';
import {planCatalogMigration} from './catalog-migration.ts';
const fixture = () => ({shop:{currencyCode:'JPY'},products:{pageInfo:{hasNextPage:false},nodes:[{
  id:'gid://shopify/Product/1',title:'Tea',handle:'tea',descriptionHtml:'<p>Tea</p>',
  options:[{name:'Size',values:['Small']}],images:{pageInfo:{hasNextPage:false},nodes:[]},
  variants:{pageInfo:{hasNextPage:false},nodes:[{id:'gid://shopify/ProductVariant/1',title:'Small',sku:'TEA-S',price:'1200',selectedOptions:[{name:'Size',value:'Small'}]}]},
}]}});
test('preserves JPY units and keeps products unpublished with no overselling',()=>{
  const [product]=planCatalogMigration(fixture());
  assert.equal(product.status,'draft');
  assert.equal(product.variants[0].prices[0].amount,1200);
  assert.equal(product.variants[0].prices[0].currency_code,'jpy');
  assert.equal(product.variants[0].allow_backorder,false);
  assert.equal(product.variants[0].manage_inventory,true);
  assert.equal(product.metadata.image_rights_verified,false);
});
test('preserves decimal prices without minor-unit conversion',()=>{
  const data=fixture(); data.shop.currencyCode='USD'; data.products.nodes[0].variants.nodes[0].price='12.50';
  assert.equal(planCatalogMigration(data)[0].variants[0].prices[0].amount,12.5);
});
test('rejects incomplete exports, invalid prices, duplicate handles and undeclared options',()=>{
  const incomplete=fixture(); incomplete.products.pageInfo.hasNextPage=true;
  assert.throws(()=>planCatalogMigration(incomplete),/Incomplete/);
  const bad=fixture(); bad.products.nodes[0].variants.nodes[0].price='NaN';
  assert.throws(()=>planCatalogMigration(bad),/price/);
  const duplicate=fixture(); duplicate.products.nodes.push(structuredClone(duplicate.products.nodes[0]));
  assert.throws(()=>planCatalogMigration(duplicate),/duplicate/);
  const option=fixture(); option.products.nodes[0].variants.nodes[0].selectedOptions[0].value='Large';
  assert.throws(()=>planCatalogMigration(option),/option/);
});
