FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    ca-certificates curl wget unzip gnupg \
    usbutils udev \
    libimobiledevice-utils ifuse usbmuxd libusbmuxd-tools \
    sqlite3 file binutils less nano iputils-ping netcat-openbsd \
    libfreetype6 libjpeg-dev zlib1g-dev tini \
    && rm -rf /var/lib/apt/lists/*

RUN cd /tmp && \
    curl -fsSL -o platform-tools.zip \
        https://dl.google.com/android/repository/platform-tools-latest-linux.zip && \
    unzip -q platform-tools.zip -d /opt && \
    rm platform-tools.zip && \
    chmod +x /opt/platform-tools/adb /opt/platform-tools/fastboot && \
    ln -sf /opt/platform-tools/adb /usr/bin/adb && \
    ln -sf /opt/platform-tools/fastboot /usr/bin/fastboot

WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages -r /app/requirements.txt

COPY Mobileforenx.py            /app/Mobileforenx.py
COPY web_interface.py           /app/web_interface.py
COPY forensic_report.py         /app/forensic_report.py
COPY content_extract.py         /app/content_extract.py
COPY root_artifact_extractor.py /app/root_artifact_extractor.py
COPY sqlite_carve.py            /app/sqlite_carve.py
COPY wireless_adb.py            /app/wireless_adb.py
COPY evidence_indexer.py        /app/evidence_indexer.py
COPY evidence_browser.py        /app/evidence_browser.py
COPY security_manager.py        /app/security_manager.py
COPY templates                  /app/templates
COPY static                     /app/static
COPY --chmod=0755 entrypoint.sh /app/entrypoint.sh

RUN mkdir -p /app/forensic_cases /app/wordlists

VOLUME ["/app/forensic_cases", "/app/wordlists"]
EXPOSE 5000

ENTRYPOINT ["/usr/bin/tini", "--", "/app/entrypoint.sh"]
CMD ["python3", "/app/web_interface.py"]
