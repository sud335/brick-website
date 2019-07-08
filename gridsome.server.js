// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const fs = require('fs');
const path = require('path');
const pick = require('lodash.pick');
const tagsets =  require('./static/tagsets.json')


module.exports = function (api, options) {
  api.loadSource(store => {
      const classes = store.addContentType({
          typeName:'TagSet',
      })

      tagsets.forEach(node=>{
          let subclasses = store.createReference('TagSet', node.subclasses);
          classes.addNode({
              id: node.id,
              path: 'tagsets/' + node.id.split('#').pop(),
              labels: node.labels,
              generatedLabel: node.generatedLabel,
              generatedAlias: node.generatedAlias,
              superclasses: store.createReference('TagSet', node.superclasses),
              subclasses: store.createReference('TagSet', node.subclasses),
              totalChildren: node.subclasses.length,
              comments: node.comments,
              definitions: node.definitions,
              equivalentClasses: store.createReference('TagSet', node.equivalentClasses),
              hierarchy: store.createReference('TagSet', node.hierarchy.split('>'))
          })
      })
  })

  api.beforeBuild(({ config, store }) => {

    // Generate an index file for Fuse to search Posts
      const postsCollections = store.getContentType('Post').collection;

      // Generate an index file for Fuse to search Apps
      const appsCollection = store.getContentType('App').collection;

      const posts = postsCollections.data.map(post => {
      return pick(post, ['title', 'path', 'summary']);
    });

      const apps = appsCollection.data.map(app => {
          return pick(app, ['title', 'path', 'summary']);
      });

    const output = {
      dir: './static',
      name: 'search.json',
      ...options.output
    }

    const outputPath = path.resolve(process.cwd(), output.dir)
    const outputPathExists = fs.existsSync(outputPath)
    const fileName = output.name.endsWith('.json')
      ? output.name
      : `${output.name}.json`

    if (outputPathExists) {
        fs.writeFileSync(path.resolve(process.cwd(), output.dir, fileName), JSON.stringify([...posts, ...apps]))
    } else {
      fs.mkdirSync(outputPath)
        fs.writeFileSync(path.resolve(process.cwd(), output.dir, fileName), JSON.stringify([...posts, ...apps]))
    }
  })
}
