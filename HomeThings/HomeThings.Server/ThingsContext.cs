using SQLite.CodeFirst;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    public class ThingsContext : DbContext
    {
        public ThingsContext() : base("ThingsContext")
        {
            // Database.SetInitializer(new CreateDatabaseIfNotExists<ThingsContext>());
        }
        public DbSet<Thing> Things { get; set; }

        public DbSet<Setting> Settings{get;set;}

        public DbSet<Input> Inputs { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            // Database does not pluralize table names
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

            var sqliteConnectionInitializer = new SqliteCreateDatabaseIfNotExists<ThingsContext>(modelBuilder);
            Database.SetInitializer(sqliteConnectionInitializer);
        }
    }

}
