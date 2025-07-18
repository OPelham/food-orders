import t from "tap";
import sinon from "sinon";
import { createIngredientRepository } from "../../../src/repositories/ingredient-repository.js";
import fs from "node:fs";

// import mocks
const mockDatabaseResponseJSON = fs.readFileSync(
  "./test/stubs/get-ingredient-by-id/postgres-database-response-success.json",
  "utf8",
);
const mockIngredientRepositoryOutputJSON = fs.readFileSync(
  "./test/stubs/get-ingredient-by-id/postgres-ingredient-repository-output-success.json",
  "utf8",
);
const mockDatabaseResponse = JSON.parse(mockDatabaseResponseJSON);
const mockIngredientRepositoryOutput = JSON.parse(
  mockIngredientRepositoryOutputJSON,
);

t.test("Ingredient Repository", async (t) => {
  const mockDb = {
    query: sinon.stub(),
  };

  const mockLog = {
    child: sinon.stub().returnsThis(),
    debug: sinon.stub(),
  };

  const repository = createIngredientRepository(mockDb);

  t.test("findById: returns result when found", async (t) => {
    mockDb.query.resolves(mockDatabaseResponse);
    const result = await repository.findById(
      mockIngredientRepositoryOutput.ingredientId,
      mockLog,
    );

    t.same(
      result,
      mockIngredientRepositoryOutput,
      "should return first row from DB",
    );
    t.ok(
      mockDb.query.calledOnceWith(
        "SELECT * FROM ingredients WHERE ingredient_id = $1",
        [mockIngredientRepositoryOutput.ingredientId],
      ),
      "should call DB with correct query and params",
    );
    t.ok(
      mockLog.child.calledOnceWith({ module: "ingredient-repository" }),
      "should use child logger",
    );
    t.ok(
      mockLog.debug.calledOnceWith({ databaseResponse: mockDatabaseResponse }),
      "should log debug message",
    );
  });

  t.test("findById: returns null when not found", async (t) => {
    mockDb.query.resolves(null);

    const result = await repository.findById("not-found", mockLog);

    t.equal(result, null, "should return null if no rows returned");
  });
});
