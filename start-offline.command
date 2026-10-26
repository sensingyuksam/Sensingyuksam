#!/bin/bash
# Double-click on a Mac to run Sensing Yuksam without internet.
cd "$(dirname "$0")"
echo "Sensing Yuksam is running at http://localhost:8000"
echo "Leave this window open. Close it to stop."
(sleep 1 && open "http://localhost:8000") &
python3 -m http.server 8000
