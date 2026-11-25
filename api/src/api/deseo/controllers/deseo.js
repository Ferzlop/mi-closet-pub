'use strict';
const { factories } = require('@strapi/strapi');
const UID = 'api::deseo.deseo';

// ¿Este registro es del usuario conectado?
const esMio = async (ctx) =>
  !!(await strapi.documents(UID).findFirst({
    filters: { documentId: ctx.params.id, usuario: { documentId: ctx.state.user.documentId } },
  }));

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
  async delete(ctx) {
    if (!(await esMio(ctx))) return ctx.forbidden();
    return super.delete(ctx);
  },
}));
