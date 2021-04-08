const { DataSource } = require("apollo-datasource");
const isEmail = require("isemail");

class UserAPI extends DataSource {
  // constructor({ store }) {
  //   super();
  //   this.store = store;
  // }

  constructor({ prisma }) {
    super();

    this.prisma = prisma.context.prisma;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config) {
    this.context = config.context;
  }

  /**
   * User can be called with an argument that includes email, but it doesn't
   * have to be. If the user is already on the context, it will use that user
   * instead
   */
  // async findOrCreateUser({ email: emailArg } = {}) {
  //   const email =
  //     this.context && this.context.user ? this.context.user.email : emailArg;
  //   if (!email || !isEmail.validate(email)) return null;

  //   const users = await this.store.users.findOrCreate({ where: { email } });
  //   return users && users[0] ? users[0] : null;
  // }

  async bookTrips({ launchIds }) {
    try {
      console.log("===bookTrips", launchIds, this.context.user);
      const userId = this.context.user.id;
      console.log("===bookTrips", launchIds, userId);
      if (!userId) return;

      let results = [];

      // for each launch id, try to book the trip and add it to the results array
      // if successful
      for (const launchId of launchIds) {
        const res = await this.bookTripPrisma({ launchId });
        if (res) results.push(res);
      }

      return results;
    } catch (error) {
      console.log("=========", error);
    }
  }

  // async bookTrip({ launchId }) {
  //   const userId = this.context.user.id;
  //   const res = await this.store.trips.findOrCreate({
  //     where: { userId, launchId },
  //   });
  //   return res && res.length ? res[0].get() : false;
  // }

  // async cancelTrip({ launchId }) {
  //   const userId = this.context.user.id;
  //   return !!this.store.trips.destroy({ where: { userId, launchId } });
  // }

  // async getLaunchIdsByUser() {
  //   const userId = this.context.user.id;
  //   const found = await this.store.trips.findAll({
  //     where: { userId },
  //   });
  //   return found && found.length
  //     ? found.map((l) => l.dataValues.launchId).filter((l) => !!l)
  //     : [];
  // }

  async isBookedOnLaunch({ launchId }) {
    if (!this.context || !this.context.user) return false;
    const userId = this.context.user.id;
    const found = await this.store.trips.findAll({
      where: { userId, launchId },
    });
    return found && found.length > 0;
  }

  async findOrCreateUserPrisma({ email: emailArg } = {}) {
    const email =
      this.context && this.context.user ? this.context.user.email : emailArg;
    if (!email || !isEmail.validate(email)) return null;

    const data = { email };

    let user = await this.prisma.user.findMany({
      where: { email: data.email },
    });

    user = !user[0]
      ? await this.prisma.user.create({
          data: data,
        })
      : user[0];

    return user;
  }

  async bookTripPrisma({ launchId }) {
    const userId = this.context.user.id;
    console.log("===launchIds", launchIds, userId);
    let res;
    try {
      res = await this.prisma.trip.upsert({
        where: { userId, launchId },
      });
    } catch (error) {
      console.log("===error", error);
    }

    return res ? res.get() : false;
  }

  async cancelTripPrisma({ launchId }) {
    const userId = this.context.user.id;
    return !!this.prisma.trip.delete({ where: { userId, launchId } });
  }

  async getLaunchIdsByUserPrisma() {
    const userId = this.context.user.id;
    const found = await this.prisma.trip.findMany({
      where: { userId },
    });
    return found && found.length
      ? found.map((l) => l.dataValues.launchId).filter((l) => !!l)
      : [];
  }

  async isBookedOnLaunchPrisma({ launchId }) {
    if (!this.context || !this.context.user) return false;
    const userId = this.context.user.id;
    const found = await this.prisma.trip.findMany({
      where: { userId, launchId },
    });
    return found && found.length > 0;
  }
}

module.exports = UserAPI;
