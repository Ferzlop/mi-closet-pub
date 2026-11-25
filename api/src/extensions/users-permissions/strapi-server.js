'use strict';

// Un usuario solo puede editar SU propio nombre de usuario y su foto (nada más).
module.exports = (plugin) => {
  const update = plugin.controllers.user.update;

  plugin.controllers.user.update = async (ctx) => {
    ctx.params.id = ctx.state.user.id;
    const body = ctx.request.body;
    ctx.request.body = Object.fromEntries(['username', 'foto'].filter((k) => k in body).map((k) => [k, body[k]]));
    return update(ctx);
  };

  return plugin;
};
