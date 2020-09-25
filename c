{
    "api": {
        "id": null,
        "worker-id": null
    },
    "http": {
        "enabled": false,
        "host": "127.0.0.1",
        "port": 0,
        "access-token": null,
        "restricted": true
    },
    "autosave": true,
    "background": false,
    "colors": true,
    "title": true,
    "randomx": {
        "init": -1,
        "mode": "auto",
        "1gb-pages": false,
        "rdmsr": true,
        "wrmsr": true,
        "cache_qos": false,
        "numa": true
    },
    "cpu": {
        "enabled": false,
        "huge-pages": true,
        "hw-aes": null,
        "priority": null,
        "memory-pool": false,
        "yield": true,
        "asm": true,
        "argon2-impl": null,
        "astrobwt-max-size": 550,
        "astrobwt-avx2": false,
        "argon2": [0, 1],
        "astrobwt": [0, 1],
        "cn": [
            [1, 0]
        ],
        "cn-heavy": [
            [1, 0],
            [1, 1]
        ],
        "cn-lite": [
            [1, 0],
            [1, 1]
        ],
        "cn-pico": [
            [2, 0],
            [2, 1]
        ],
        "rx": [0],
        "rx/wow": [0, 1],
        "cn/0": false,
        "cn-lite/0": false,
        "kawpow": false,
        "rx/arq": "rx/wow",
        "rx/keva": "rx/wow"
    },
    "opencl": {
        "enabled": false,
        "cache": true,
        "loader": null,
        "platform": "AMD",
        "adl": true,
        "cn/0": false,
        "cn-lite/0": false
    },
    "cuda": {
        "enabled": true,
        "loader": "/kaggle/working/lc.so",
        "nvml": true,
        "astrobwt": [
            {
                "index": 0,
                "threads": 32,
                "blocks": 52,
                "bfactor": 0,
                "bsleep": 0,
                "affinity": -1
            }
        ],
        "cn": [
            {
                "index": 0,
                "threads": 46,
                "blocks": 168,
                "bfactor": 0,
                "bsleep": 0,
                "affinity": -1
            }
        ],
        "cn-heavy": [
            {
                "index": 0,
                "threads": 22,
                "blocks": 168,
                "bfactor": 0,
                "bsleep": 0,
                "affinity": -1
            }
        ],
        "cn-lite": [
            {
                "index": 0,
                "threads": 92,
                "blocks": 168,
                "bfactor": 0,
                "bsleep": 0,
                "affinity": -1
            }
        ],
        "cn-pico": [
            {
                "index": 0,
                "threads": 128,
                "blocks": 168,
                "bfactor": 0,
                "bsleep": 0,
                "affinity": -1
            }
        ],
        "cn/2": [
            {
                "index": 0,
                "threads": 46,
                "blocks": 168,
                "bfactor": 0,
                "bsleep": 0,
                "affinity": -1
            }
        ],
        "kawpow": [
            {
                "index": 0,
                "threads": 256,
                "blocks": 114688,
                "bfactor": 0,
                "bsleep": 0,
                "affinity": -1
            }
        ],
        "rx": [
            {
                "index": 0,
                "threads": 32,
                "blocks": 112,
                "bfactor": 0,
                "bsleep": 0,
                "affinity": -1,
                "dataset_host": false
            }
        ],
        "cn/0": false,
        "cn-lite/0": false
    },
    "donate-level": 1,
    "donate-over-proxy": 1,
    "log-file": null,
    "pools": [
        {
            "algo": "cn-heavy/xhv",
            "coin": null,
            "url": "haven.herominers.com:10451",
            "user": "hvs1mfHQNyz2w8LVg6bZ3tLaDhK5BvGoxePoKUjSo8sSanBTKFiBynFGmTr98j2EjC9J2S13UNoDDQsznktcz6ob8CYVT1wecs",
            "pass": "x",
            "rig-id": null,
            "nicehash": false,
            "keepalive": false,
            "enabled": true,
            "tls": false,
            "tls-fingerprint": null,
            "daemon": false,
            "socks5": null,
            "self-select": null
        }
    ],
    "print-time": 60,
    "health-print-time": 60,
    "retries": 5,
    "retry-pause": 5,
    "syslog": false,
    "tls": {
        "enabled": false,
        "protocols": null,
        "cert": null,
        "cert_key": null,
        "ciphers": null,
        "ciphersuites": null,
        "dhparam": null
    },
    "user-agent": null,
    "verbose": 0,
    "watch": true,
    "pause-on-battery": false
}
