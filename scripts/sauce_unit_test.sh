export MODE=saucelabs_optional
export SAUCE_USERNAME=elastic-apm
export SAUCE_ACCESS_KEY=8e8b688d-cee9-4a7b-9fd4-bb4e01f0421c

echo $MODE

gulp test:unit:sauce