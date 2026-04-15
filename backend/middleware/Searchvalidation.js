const { validateSearch } = require("../model/quesryverifiction");
const express=require("express")
const router=express.Router();
router.post("/", async (req, res) => {
  const { query } = req.body;
  console.log("Received query:", query);

  try {
    const result = await validateSearch(query);
    console.log("Raw result from OpenAI:", result);

    const parsed = JSON.parse(result); 
    res.json(parsed);
  } catch (err) {
    console.error("Validation error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});
module.exports=router;
