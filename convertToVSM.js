/**
 * @author: Mostafa Bayomi
 * bayomim@tcd.ie
 * 
 * The main file to run the conversion module. 
 * Use this module to convert text into vectors of classes to work with OntoSeg.
 *  * This module converts each sentence is a given text into a vector of DBpedia classes.
 * The input should be text files where each sentence is in one line. 
 * You can use any sentence splitter algorithm to split text into sentences.
 * All your files should be in .txt fomat and the path to the directory containing them should be passed to the "walk" method
 * The output is a file (with .vsm extention) that has the corresponding DBpedia classes for each sentence
 * The module uses DBpedia-Spotlight to identify entities in each sentence and to map eac entity to its classes in DBpedia ontology.
 * For example: for a file called file1.txt, consider the first sentence in that file is:
 * "In the first part of ROBINSON CRUSOE, at page one hundred and twenty-nine, you will find it thus written"
 * This module will convert this sentence into:
 * [["Organisation","Agent"],["WrittenWork","Work","Book"]]
 * This means that there are two entities in that sentence (based on the Named Entity Recognition algorithm of DBpedia-Spotlight) where the first entity is mapped 
 * to the two DBpedia classes ["Organisation","Agent"] and the second entity is mapped to the three DBpedia classes ["WrittenWork","Work","Book"]
 * 
 * If a scenence doesn't have entities, the sentence entry is represented as [[#Not_Found]] in the produces file.
 */

var txtasvsm = require('txtasvsm'); // a node module I created to convert text into a vector of classes of found entities in each sentence
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

/**
 * The declaration of the "walk" method
 * @param {*} dir the directory where your files are
 * @param {*} done a callback when finish reading the paths of the files in the given directory
 */
var walk = function (dir, done) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function (file) {
      file = path.resolve(dir, file);
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function (err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};
var results;
/**
 * The first parameter is the path to the directory where data exists. 
 * The method will walk through all sub-directories in the given path and load all files 
 */
walk("data/haps/text/9",function (err, outResults) { 
        if (err) {
         console.log("Error: "+err);
          throw err;
        }
        else {
			results = outResults; // outResults: a list (array) containing all absolute paths of all found files in that directory and sub-directories. I make it = to results, the global array to be accessible from anywhere in the code
			run(0); // start running from index 0 in the "results" list (start from the first file)
		}
});

function run(index){
			var file = results[index];
			txtasvsm.run_vsm_system(file, function(){ // see "txtasvsm" module in  "node_modules" for more description
				index++;
				if(index<results.length)
					run(index);
			});
}
