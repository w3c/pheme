
module.exports = {
    w3cmemes: {
        origin:         "W3CMemes"
    ,   name:           "W3CMemes"
    ,   description:    "The official news agency for the W3C community"
    }
,   w3cnews: {
        origin:         "W3C News"
    ,   name:           "W3C News"
    ,   description:    "The party line"
    }
,   "html-wg":  {
        origin:         "github"
    ,   name:           "HTML WG"
    ,   description:    "HTML Working Group work stream"
    ,   repository:     [
                            "w3c/html"
                        ,   "w3c/charter-html"
                        ,   "w3c/test-results"
                        ,   "w3c/dom"
                        ,   "w3c/aria-in-html"
                        ]
    }
,   wpt:  {
        origin:         "github"
    ,   name:           "WPT"
    ,   description:    "Web Platform Tests work stream"
    ,   repository:     [
                            "w3c/web-platform-tests"
                        ,   "w3c/wpt-runner"
                        ,   "w3c/test-results"
                        ,   "w3c/wpt-tools"
                        ,   "w3c/testharness.js"
                        ]
    }
,   "modern-tooling":   {
        origin:         "github"
    ,   name:           "Modern Tooling"
    ,   description:    "Work stream for the Modern Tooling project"
    ,   repository:     [
                            "w3c/echidna"
                        ,   "w3c/modern-tooling"
                        ,   "w3c/pheme"
                        ,   "w3c/midgard"
                        ,   "w3c/ash-nazg"
                        ,   "w3c/specberus"
                        ,   "w3c/respec"
                        ,   "w3c/respec-docs"
                        ,   "w3c/w3c-api"
                        ,   "w3c/developers"
                        ,   "w3c/third-party-resources-checker"
                        ,   "w3c/tr-design"
                        ]
  ,      ignoreSender: ["dependabot[bot]", "github-actions[bot]"]
    }
,   "html-future":   {
        origin:         "github"
    ,   name:           "Future of HTML"
    ,   description:    "Discussion on the future of HTML"
    ,   repository:     [
                            "w3c/charter-html"
                        ]
    }
,   "webrtc":   {
        origin:         "github"
    ,   name:           "WebRTC specs"
    ,   description:    "Github activity on WebRTC specs"
    ,   repository:     [
                            "w3c/webrtc-pc"
                        ,   "w3c/webrtc-identity"
                        ,   "w3c/webrtc-quic"
                        ,   "w3c/webrtc-ice"
                        ,   "w3c/webrtc-priority"
                        ,   "w3c/webrtc-nv-use-cases"
                        ,   "w3c/mediacapture-main"
                        ,   "w3c/mediacapture-record"
                        ,   "w3c/mediacapture-image"
                        ,   "w3c/mediacapture-fromelement"
                        ,   "w3c/mediacapture-output"
                        ,   "w3c/webrtc-stats"
                        ,   "w3c/mediacapture-screen-share"
                        ,   "w3c/webrtc-charter"
                        ,   "w3c/webrtc-respec-ci"
                        ,   "w3c/mst-content-hint"
      ,   "w3c/webrtc-interop-reports"
      ,   "w3c/webrtc-svc"
      ,   "w3c/webrtc-extensions"
      ,   "w3c/mediacapture-extensions"
      ,   "w3c/webrtc-provisional-stats",
      "w3c/webrtc-encoded-transform", "w3c/mediacapture-automation", "w3c/mediacapture-transform", "w3c/mediacapture-region", "w3c/mediacapture-handle", "w3c/mediacapture-viewport", "w3c/media-pipeline-arch"
    ]
    }
,   "csvw":   {
        origin:         "github"
    ,   name:           "CSVW Specs"
    ,   description:    "Github activity on the CSV on the Web specs"
    ,   repository:     [
                            "w3c/csvw"
                        ]
    }
,   "dpub":   {
        origin:         "github"
    ,   name:           "DPUB documents"
    ,   description:    "Github activity around digital publishing"
    ,   repository:     [
                            "w3c/dpub",
                            "w3c/dpub-accessibility",
                            "w3c/dpub-annotation",
                            "w3c/dpub-content-and-markup",
                            "w3c/dpub-metadata",
                            "w3c/dpub-stem",
                            "w3c/dpub-validation",
                            "w3c/dpub-pwp",
                            "w3c/dpub-pwp-loc",
                            "w3c/dpub-pwp-arch",
                            "w3c/dpub-pwp-ucr"
                        ]
    }
,   "publ": {
        origin:      "github"
    ,   name:        "Publishing Working Group documents"
    ,   description: "Github activities around the Publishing on the Web WG specs"
    ,   repository:  [
                         "w3c/publ-wg",
                         "w3c/wpub",
                         "w3c/pwpub",
                         "w3c/epub4",
                         "w3c/dpub-aria-2.0",
                         "w3c/publ-a11y"
                     ]
    }
,   "poe": {
        origin:      "github"
    ,   name:        "POE Working Group documents"
    ,   description: "Github activity around the Permissions and Obligations Expression Working Group"
    ,   repository:  [
                         "w3c/poe"
                     ]
    }
,   "annotation":   {
        origin:         "github"
    ,   name:           "Web Annotations specs"
    ,   description:    "Github activity on Web Annotation specs"
    ,   repository:     [
                            "w3c/web-annotation",
                            "w3c/findtext"
                        ]
    }
,   "das":   {
        origin:         "github"
    ,   name:           "Device & Sensors specs"
    ,   description:    "Github activity on Device & Sensors Working Group specs"
    ,   repository:     [
                            "w3c/sensors"
                        ,   "w3c/ambient-light"
                        ,   "w3c/proximity"
                        ,   "w3c/vibration"
                        ,   "w3c/battery"
                        ,   "w3c/wake-lock"
                        ,   "w3c/html-media-capture"
                        ,   "w3c/devicesensors-wg"
                        ,   "w3c/gyroscope"
                        ,   "w3c/accelerometer"
                        ]
    }
,   "immersiveweb":   {
        origin:         "github"
    ,   name:           "Immersive Web Repositories"
    ,   description:    "Github activity on Immersive Web CG & WG"
    ,   repository:     [
                            "immersive-web/webxr"
                        ,   "immersive-web/webxr-gamepads-module"
                        ,   "immersive-web/webxr-ar-module"
                        ,   "immersive-web/hit-test"
                        ,   "immersive-web/dom-overlays"
                        ,   "immersive-web/layers"
                        ,   "immersive-web/anchors"
                        ,   "immersive-web/lighting-estimation"
                        ,   "immersive-web/webxr-hand-input"

                        ,   "immersive-web/webxr-samples"
                        ,   "immersive-web/proposals"

                        ,   "immersive-web/navigation"
                        ,   "immersive-web/computer-vision"
                        ,   "immersive-web/geo-alignment"
                        ,   "immersive-web/real-world-geometry"
                        ,   "immersive-web/spatial-favicons"
                        ,   "immersive-web/performance-improvements"
                        ,   "immersive-web/marker-tracking"
                        ,   "immersive-web/capture"
                        ,   "immersive-web/depth-sensing"

                        ,   "immersive-web/homepage"
                        ,   "immersive-web/privacy-and-security"
                        ,   "immersive-web/administrativia"
                        ,   "immersive-web/community-resources"
                        ,   "immersive-web/immersive-web.github.io"
                        ]
    }
,   "machinelearning":   {
        origin:         "github"
    ,   name:           "Web Machine Learning Repositories"
    ,   description:    "Github activity on WebML WG"
    ,   repository:     [
                            "webmachinelearning/webnn"
                        ,   "webmachinelearning/model-loader"
                        ,   "webmachinelearning/meetings"
                        ,   "webmachinelearning/proposals"
                        ,   "webmachinelearning/webmachinelearning-ethics"
    ]
    }
,   "web-networks":   {
        origin:         "github"
    ,   name:           "Web & Networks IG Repositories"
    ,   description:    "Github activity on Web & Networks Interest Group"
  ,   repository:     [
    "w3c/edge-computing-web-exploration",
    "w3c/network-emulation",
    "w3c/web-networks"
  ]
}
  , "reffy": {
    origin: "github",
    name: "Reffy ecosystem",
    description: "Github activity on reffy et al",
    repository: ["w3c/reffy", "w3c/strudy", "w3c/browser-specs", "w3c/webref", "w3c/browser-statuses"]
    ,      ignoreSender: ["dependabot[bot]", "github-actions[bot]"]
  }
,   mediawg: {
        origin:         "github"
    ,   name:           "Media WG"
    ,   description:    "Specs from the Media WG"
    ,   repository:     [
                            "w3c/media-wg"
                        ,   "w3c/charter-media-wg"
                        ,   "w3c/autoplay"
                        ,   "w3c/encrypted-media"
                        ,   "w3c/media-capabilities"
                        ,   "w3c/media-playback-quality"
                        ,   "w3c/mediasession"
                        ,   "w3c/media-source"
                        ,   "w3c/picture-in-picture"
                        ,   "w3c/webcodecs"
                        ,   "w3c/mse-byte-stream-format-registry"
                        ,   "w3c/mse-byte-stream-format-mpeg-audio"
                        ,   "w3c/mse-byte-stream-format-webm"
                        ,   "w3c/mse-byte-stream-format-mp2t"
                        ,   "w3c/mse-byte-stream-format-isobmff"
                        ]
  }
,   secondscreen: {
        origin:         "github"
    ,   name:           "Second Screen WG/CG"
    ,   description:    "Specs from the Second Screen WG/CG"
    ,   repository:     [
                            "w3c/secondscreen-wg"
                        ,   "w3c/presentation-api"
                        ,   "w3c/remote-playback"
                        ,   "w3c/openscreenprotocol"
                        ,   "w3c/window-placement"
                        ,   "w3c/secondscreen-charter"
                        ,   "webscreens/cg-charter"
                        ,   "webscreens/webscreens.github.io"
                        ]
  }
,   gpuweb: {
        origin:         "github"
    ,   name:           "GPU for the Web WG/CG"
    ,   description:    "Specs from the GPU for the Web WG/CG"
    ,   repository:     [
                            "gpuweb/admin"
                        ,   "gpuweb/gpuweb"
                        ,   "gpuweb/cts"
                        ,   "w3c/gpuweb-wg"
                        ]
  }
,   "media-and-entertainment": {
        origin:         "github"
    ,   name:           "Media and Entertainment"
    ,   description:    "Discussions tracked by the Media and Entertainment IG"
    ,   repository:     [
                            "w3c/media-and-entertainment"
                        ,   "w3c/avmedia-formats-cg"
                        ,   "w3c/ColorWeb-CG"
                        ,   "w3c/webmediaapi"
                        ,   "w3c/webmediaguidelines"
                        ,   "w3c/me-media-integration-guidelines"
                        ,   "w3c/me-media-timed-events"
                        ,   "w3c/me-cloud-browser"
                        ,   "w3c/me-vision"
                        ,   "webtiming/timingobject"
                        ]
}
};
