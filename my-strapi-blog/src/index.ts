import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Set up public permissions for the API
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (publicRole) {
      const permissions = await strapi
        .query('plugin::users-permissions.permission')
        .findMany({ where: { role: publicRole.id } });

      const existingActions = permissions.map((p: any) => p.action);

      // Define public permissions needed
      const publicPermissions = [
        'api::blog.blog.find',
        'api::blog.blog.findOne',
        'api::blog.blog.create',
        'api::blog.blog.update',
        'api::blog.blog.delete',
        'api::category.category.find',
        'api::category.category.findOne',
        'api::tag.tag.find',
        'api::tag.tag.findOne',
        'plugin::upload.content-api.upload',
      ];

      for (const action of publicPermissions) {
        if (!existingActions.includes(action)) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: publicRole.id,
            },
          });
          console.log(`Created public permission: ${action}`);
        }
      }
    }

    // Set up authenticated permissions
    const authRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (authRole) {
      const permissions = await strapi
        .query('plugin::users-permissions.permission')
        .findMany({ where: { role: authRole.id } });

      const existingActions = permissions.map((p: any) => p.action);

      // Define authenticated permissions needed
      const authPermissions = [
        'api::blog.blog.find',
        'api::blog.blog.findOne',
        'api::blog.blog.create',
        'api::blog.blog.update',
        'api::blog.blog.delete',
        'api::category.category.find',
        'api::category.category.findOne',
        'api::tag.tag.find',
        'api::tag.tag.findOne',
        'plugin::upload.content-api.upload',
      ];

      for (const action of authPermissions) {
        if (!existingActions.includes(action)) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: authRole.id,
            },
          });
          console.log(`Created authenticated permission: ${action}`);
        }
      }
    }
  },
};
