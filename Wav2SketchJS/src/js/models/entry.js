'use strict';
var Backbone = require('backbone');
//Backbone.LocalStorage = require("backbone.localstorage");
var Base64Binary = require('../helpers/base64binary.js');

module.exports = Backbone.Model.extend({

    defaults: function () {
        return {
            filename: "empty file...",
            samplename: "",
            done: false,
            zoomLevel: 1,
        };
    },

    //localStorage: new Backbone.LocalStorage("Entries"),

    play: function() {
        var array = Base64Binary.decodeArrayBuffer(this.get('file'));

        App.Audio.context.decodeAudioData(array, function(buffer) {
            var source = App.Audio.context.createBufferSource(); // creates a sound source
            source.buffer = buffer;                    // tell the source which sound to play
            source.connect(App.Audio.context.destination);       // connect the source to the context's destination (the speakers)
            source.start(0);

        }, function(e){"Error with decoding audio data" + e.err});

    },

    convert: function () {

        console.log("converting " + this.get('samplename') + " ...");

        var reader = new FileReader();
        reader.onload = function () {

            // compute the extra padding needed
            var padding = function (length, block) {
                var extra = length % block;
                if (extra == 0) return 0;
                return block - extra;
            };

            var arrayBuffer = reader.result;
            var data = new DataView(arrayBuffer);

            var pcm_mode = false; // TODO
            var format, channels, bits;
            var rate;

            var i, length, padlength = 0, arraylen;
            var audio = 0;
            var bcount = 0;

            // read the WAV file's header
            if (data.getInt32(0, false) != 0x52494646) {
                console.error("bad file format in ", this.get("filename"));
            }

            // The default byte ordering assumed for WAVE data files is little-endian.
            format = data.getUint16(20, true);
            channels = data.getUint16(22, true);
            rate = data.getUint32(24, true);
            bits = data.getUint16(34, true);

            if (format != 1)
                console.error("file " + this.get("filename") + " is compressed, only uncompressed supported");
            if (rate != 44100 && rate != 22050 && rate != 11025 /*&& rate != 8000*/)
                console.error("sample rate " + rate + " in " + this.get("filename") + " is unsupported. Only 44100, 22050, 11025 work");
            if (channels != 1 && channels != 2)
                console.error("file " + this.get("filename") + " has " + channels + " channels, but only 1 & 2 are supported");
            if (bits != 16)
                console.error("file " + this.get("filename") + " has " + bits + " bit format, but only 16 is supported");

            if (data.getUint32(36, false) != 0x64617461) {
                console.error("bad file format in ", this.get("filename"));
            }

            var length = data.getUint32(40, true);

            console.info(format, channels, rate, bits, length);

            // the length must be a multiple of the data size
            if (channels == 2) {
                if (length % 4) console.error("file " + this.get("filename") + " data length is not a multiple of 4");
                length = length / 4;
            }
            if (channels == 1) {
                if (length % 1) console.error("file " + this.get("filename") + " data length is not a multiple of 2");
                length = length / 2;
            }
            if (length > 0xFFFFFF) console.error("file " + this.get("filename") + " data length is too long");

            // AudioPlayMemory requires padding to 2.9 ms boundary (128 samples @ 44100)
            if (rate == 44100) {
                padlength = padding(length, 128);
                format = 1;
            } else if (rate == 22050) {
                padlength = padding(length, 64);
                format = 2;
            } else if (rate == 11025) {
                padlength = padding(length, 32);
                format = 3;
            }
            if (pcm_mode) {
                arraylen = Math.floor(((length + padlength) * 2 + 3) / 4 + 1);
                console.info("arraylen", arraylen);
                format |= 0x80;
                console.info("format", format);
            } else {
                arraylen = Math.floor((length + padlength + 3) / 4 + 1);
            }
            //total_length += arraylen;

            // output a minimal header, just the length, #bits and sample rate
            var outh = "// Audio data converted from WAV file by wav2sketch\n\n";
            outh += "extern const unsigned int " + this.get("samplename") + "[" + arraylen + "];";
            //console.log(outh);

            // save h file
            this.set('hfile_base64', btoa(outh));
            //this.save(); // not yet

            var dec2hex = function (i) {
                return '0x' + (i + 0x100000000).toString(16).substr(-8).toUpperCase();
            };

            // write the cpp file
            var out = "// Audio data converted from WAV file by wav2sketch\n\n";
            out += "#include \"" + this.get("samplename") + ".h\"\n\n";
            out += "// Converted from "+ this.get("filename") +", using "+ rate +" Hz, "+ (pcm_mode ? "16 bit PCM" : "u-law")  +" encoding\n";
            out += "const unsigned int " + this.get("samplename") + "[" + arraylen + "] = {\n";
            out += dec2hex(length | (format << 24));
            out += ",";

            var wcount = 1;
            var buf32 = 0;

            // pack the output bytes into 32 bit words, lsb first, and
            // format the data nicely with commas and newlines
            var print_byte = function (b) {

                buf32 |= (b << (8 * bcount++));

                if (bcount >= 4) {
                    out += dec2hex(buf32);
                    out += ',';
                    buf32 = 0;
                    bcount = 0;
                    if (++wcount >= 8) {
                        out += "\n";
                        wcount = 0;
                    }
                }
            };

            var ulaw_encode = function(audio)
            {
                var mag, neg;
                // http://en.wikipedia.org/wiki/G.711
                if (audio >= 0) {
                    mag = audio;
                    neg = 0;
                } else {
                    mag = audio * -1;
                    neg = 0x80;
                }
                mag += 128;
                if (mag > 0x7FFF) mag = 0x7FFF;
                if (mag >= 0x4000) return neg | 0x70 | ((mag >> 10) & 0x0F);  // 01wx yz00 0000 0000
                if (mag >= 0x2000) return neg | 0x60 | ((mag >> 9) & 0x0F);   // 001w xyz0 0000 0000
                if (mag >= 0x1000) return neg | 0x50 | ((mag >> 8) & 0x0F);   // 0001 wxyz 0000 0000
                if (mag >= 0x0800) return neg | 0x40 | ((mag >> 7) & 0x0F);   // 0000 1wxy z000 0000
                if (mag >= 0x0400) return neg | 0x30 | ((mag >> 6) & 0x0F);   // 0000 01wx yz00 0000
                if (mag >= 0x0200) return neg | 0x20 | ((mag >> 5) & 0x0F);   // 0000 001w xyz0 0000
                if (mag >= 0x0100) return neg | 0x10 | ((mag >> 4) & 0x0F);   // 0000 0001 wxyz 0000
                                   return neg | 0x00 | ((mag >> 3) & 0x0F);   // 0000 0000 1wxy z000
            }


            // finally, read the audio data
            var audiodata = new DataView(arrayBuffer, 44);

            for (var i = 0; i < (length*(2*channels)); i+=(2*channels)) {
                if (channels == 1) {
                    audio = audiodata.getInt16(i, true);
                } else {
                    /*
                    audio = Math.abs(audiodata.getUint16(i, true) + audiodata.getUint16(i + 2, true));
                    audio = Math.floor(audio/2.0);
                    */
                    audio = audiodata.getInt16(i, true);
                    audio = audiodata.getInt16(i + 2, true);
                }
                if (pcm_mode) {
                    print_byte(audio & 0xff);
                    print_byte((audio >> 8) & 0xff);
                } else {
                    print_byte(ulaw_encode(audio));
                }

            }

            while (padlength > 0) {
                print_byte(0);
                padlength--;
            }
            while (bcount > 0) {
                print_byte(0);
            }
            if (wcount > 0) {
                out += "\n";
            }
            out += "};\n";

            // save cpp file
            this.set('cppfile_base64', btoa(out));

            // save the model
            this.save();

            this.trigger('converted');

        }.bind(this);

        var array = Base64Binary.decodeArrayBuffer(this.get('file'));
        var blob = new Blob([array], {type: 'application/octet-binary'});
        reader.readAsArrayBuffer(blob);

    },

    capitalizeFirstLetter: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    getSampleName: function (filename) {
        var len, i, n;
        var c;
        var filename_no_ext = filename.replace(/\.[^/.]+$/, ""); // remove extension
        filename_no_ext = filename_no_ext.replace(/\s+/g, '_'); // replace spaces with _
        filename_no_ext = this.capitalizeFirstLetter(filename_no_ext); // capitalize first character
        filename_no_ext = "AudioSample" + filename_no_ext; // put something (non-numeric) in front
        return filename_no_ext;
    },


});

