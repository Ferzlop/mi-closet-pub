'use strict';
const { factories } = require('@strapi/strapi');
const UID = 'api::categoria.categoria';

// Las categorías solo se listan y se crean (no se editan ni se borran en esta versión)
module.exports = factories.createCoreController(UID, () => ({
  async find(ctx) {
    const query = await this.sanitizeQuery(ctx);
    const { results, pagination } = await strapi.service(UID).find({
      ...query,
      filters: { usuario: { documentId: ctx.state.user.documentId } },
    });
    return this.transformResponse(await this.sanitizeOutput(results, ctx), { pagination });
  },
  async create(ctx) {
    const entry = await strapi.documents(UID).create({
      data: { ...ctx.request.body.data, usuario: ctx.state.user.documentId },
    });
    return this.transformResponse(await this.sanitizeOutput(entry, ctx));
  },
}));
