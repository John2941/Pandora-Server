#/cygdrive/c/Users/Johnathan/Anaconda/python

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime
from unidecode import unidecode
import os 
import cgi
import eyed3
import urllib2

SAVE_SONGS_PATH = "E:\Pandora Rips" 
# Will be the base directory. Folders will be created for each station 
# 	and the mp3s will be placed in those station folders
PORT_NUMBER = 8080
ENABLE_SONG_REWRITE = False 
# Keep on False unless you have a specific reason
HIGH_QAULITY_ONLY = True 
# Keep on False unless you have Pandora One

class myHandler(BaseHTTPRequestHandler):
	'''Handles post request and saves song'''
	def log_message(self, *args):  # Suppress Logs
		pass

	# Handler for the POST requests
	def do_POST(self):
		if self.path == "/send":
			form = cgi.FieldStorage(
				fp=self.rfile,
				headers=self.headers,
				environ={'REQUEST_METHOD': 'POST',
						 'CONTENT_TYPE': self.headers['Content-Type'],
						 })
			song = {}
			for key in form.keys():
				# populates the song object sent from the chrome extension
				song[key] = form[key].value
			required_keys = ['album','artist','quality','song','station','url']
			# these keys are required for folder and 
			#	file creation as well as downloading the file
			missing_keys = list(set(required_keys) - set(song.keys()))
			if missing_keys:
				print "ERROR: Missing song objects: {0}".format(','.join(missing_keys))
				return False
			if HIGH_QAULITY_ONLY and song['quality'] != 'audio/mpeg':
				print "ERROR: Song provided did not meet the quality requested."
				return False
			if song['url'][:7] != "http://":
				# make sure the url actually ressembles a url
				print "ERROR: Url provided was not valid."
				return False
			song['song'] = format_string(song['song'])
			song['artist'] = format_string(song['artist'])
			# Properly format string for file name
			print "{0} | {1:25s}".format(
									datetime.now().strftime('%m-%d %H:%M'), 
									song['song'][:25]),
			self.send_response(200)
			self.send_header('Access-Control-Allow-Origin', '*')
			self.end_headers()
			not_already_dl(song)

def format_string(_str):
	'''Gets rid of unicode and characters that can't be saved in file name'''
	new_word = unidecode(_str.decode('utf-8'))
	bad_chars = "/?^&%$#@!*\\!=+|[],':"
	return ''.join(x for x in new_word if x not in bad_chars)


def not_already_dl(song):
	'''Check and make sure song is not already in the station's folder'''
	fp = SAVE_SONGS_PATH + "\\" + song['station'] + "\\"
	song_name = song['song'] + " - " + song['artist'] + '.mp3'
	try:
		# Check and see if folder exists
		os.stat(fp) 
	except:
		os.makedirs(fp)
	if not ENABLE_SONG_REWRITE:
		# rewrite mp3 if enabled
		if song_name in os.listdir(fp):
			print " | {0:>7s} bytes  | {1}".format("-", "Failed")
			return False
	download_song(song)

	
def download_song(song):
	'''Downloads song from url in song object'''
	try: u = urllib2.urlopen(song['url'])
	except:
		print " | {0:>7s} bytes  | {1}".format("-", "URL ERROR")
		return False
	song_file_name = song['song'] + " - " + song['artist']
	station_dir = SAVE_SONGS_PATH + "/" + song['station'] + "/"
	absolute_song_fp = station_dir + song_file_name + ".mp3"
	meta = u.info()
	file_size = int(meta.getheaders("Content-Length")[0])
	print " | {0:>7} bytes".format(str(file_size)[:7]),
	buffer = u.read()
	with open(absolute_song_fp,'wb') as f:
		f.write(buffer)
	u.close()
	print " | Success",
	mp3_tag(absolute_song_fp, song)

def mp3_tag(absolute_song_fp, song):
	'''tag mp3 with metaata'''
	try:
		mp3 = eyed3.load(absolute_song_fp)
		eyed3.log.setLevel("ERROR")
		mp3.initTag()
		mp3.tag.artist = unicode(song['artist'])
		mp3.tag.title = unicode(song['song'])
		mp3.tag.album = unicode(song['album'])
		mp3.tag.save()
	except:
		print " - No mp3 tags",
	print ""

try:
	'''Create a web server and define the handler to manage the incoming request'''
	server = HTTPServer(('127.0.0.1', PORT_NUMBER), myHandler)
	print 'Started httpserver on port ', PORT_NUMBER
	# Wait forever for incoming http requests
	server.serve_forever()
except KeyboardInterrupt:
	print '^C received, Saving last song...'
	print 'shutting down the web server'
	server.socket.close()