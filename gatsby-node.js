// Gatsby Dash Node.Gatsby Dash Node.JS
//So within this Gatsby node JS we can export a particular function from here which will go ahead and
// create pages within our Gatsby site based on the pages we have in our WordPress site.
// JS So within this Gatsby node JS we can export a particular function from here which will go ahead and
// create pages within our Gatsby site based on the pages we have in our WordPress site.

const path = require("path");
const {
  assignIds,
  assignGatsbyImage,
} = require("@webdeveducation/wp-block-tools");
const fs = require("fs");

exports.createPages = async ({ actions, graphql }) => {
  const pageTemplate = path.resolve("src/templates/page.js");
  const { createPage } = actions;

  const { data } = await graphql(`
    query getAllPages {
      wp {
        themeStylesheet
      }
      allWpCar {
        nodes {
          databaseId
          blocks
          uri
        }
      }
      allWpPage {
        nodes {
          databaseId
          blocks
          uri
        }
      }
    }
  `);

  try {
    fs.writeFileSync("./public/themeStylesheet.css", data.wp.themeStylesheet);
  } catch (e) {}

  const allPage = [...data.allWpPage.nodes, ...data.allWpCar.nodes];

  for (let i = 0; i < allPage.length; i++) {
    const page = allPage[i];
    let blocks = page.blocks;
    blocks = assignIds(blocks);
    blocks = await assignGatsbyImage({
      blocks,
      graphql,
      coreMediaText: true,
      coreImage: true,
      coreCover: true,
    });
    createPage({
      path: page.uri,
      component: pageTemplate,
      context: {
        blocks,
        databaseId: page.databaseId,
      },
    });
  }
};
