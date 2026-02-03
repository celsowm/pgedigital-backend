import "../src/polyfills";
import "dotenv/config";
import { bootstrapEntityTables } from "../src/entities";
import { UsuarioThumbnailService } from "../src/services/usuario-thumbnail.service";

bootstrapEntityTables();

async function main() {
  console.log("Starting usuario thumbnail update from LDAP...\n");
  
  try {
    const service = new UsuarioThumbnailService();
    const result = await service.updateFromLdap({ logger: console });
    
    console.log("\n=== Summary ===");
    console.log(`Total users: ${result.total}`);
    console.log(`Updated: ${result.updated}`);
    console.log(`Skipped (no LDAP thumbnail): ${result.skipped}`);
    console.log(`Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log("\nErrors:");
      for (const err of result.errors) {
        console.log(`  - ${err.login}: ${err.error}`);
      }
    }
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
