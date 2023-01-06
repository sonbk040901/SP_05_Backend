const express = require("express");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api", routes);
app.use("/", (req, res) => {
  res.status(403).send(
    "<h1 id='content'>Access Denied</h1 ><style>h1{color:red;position: fixed;inset: 50% auto auto 50%; overflow: auto;transition: all 1s;}</style> " +
      `<script>
          let content = document.getElementById('content');
          const cw = content.offsetWidth;
          const ch = content.offsetHeight;
          setInterval(() => {
              let w = Math.floor(Math.random() * (window.innerWidth - cw));
              let h = Math.floor(Math.random() * (window.innerHeight - ch)); 
              let randomColor = Math.floor(Math.random()*16777215).toString(16);
              content.style.top = h + 'px';content.style.left = w + 'px';
              content.style.color = '#' + randomColor;
            }, 1100);
        </script>`
  );
});

app.listen(5000, () => {
  console.log(`Server started on port ${PORT}`);
});
