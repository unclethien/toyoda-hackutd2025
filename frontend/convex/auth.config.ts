/**
 * Convex Auth Configuration
 *
 * This file configures Auth0 JWT verification for Convex.
 * Convex will automatically verify JWT tokens from Auth0 and make
 * the user identity available in ctx.auth.getUserIdentity()
 */

export default {
  providers: [
    {
      domain: "https://dev-0hgz613sulw430rh.us.auth0.com/",
      applicationID: "convex",
    },
  ],
};
