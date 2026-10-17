const { withXcodeProject } = require('@expo/config-plugins');

const BUILD_PHASE_NAME = '[Listen AI] Copy offline TTS model';

function withOfflineTtsAssets(config) {
  return withXcodeProject(config, (nextConfig) => {
    const project = nextConfig.modResults;
    const targetName = nextConfig.modRequest.projectName || '';
    const targetId = project.findTargetKey(targetName);
    if (!targetId) {
      throw new Error('Offline TTS modelini paketlemek için iOS hedefi bulunamadı.');
    }

    const buildPhases = project.pbxNativeTargetSection()[targetId]?.buildPhases || [];
    if (buildPhases.some((phase) => phase.comment === BUILD_PHASE_NAME)) return nextConfig;

    project.addBuildPhase([], 'PBXShellScriptBuildPhase', BUILD_PHASE_NAME, targetId, {
      shellPath: '/bin/sh',
      shellScript: `set -e
MODEL_SOURCE="${'${PROJECT_DIR}'}/../assets/models"
MODEL_DESTINATION="${'${TARGET_BUILD_DIR}'}/${'${UNLOCALIZED_RESOURCES_FOLDER_PATH}'}/models"

if [ ! -d "$MODEL_SOURCE" ]; then
  echo "error: Offline TTS model directory is missing: $MODEL_SOURCE"
  exit 1
fi

rm -rf "$MODEL_DESTINATION"
mkdir -p "$MODEL_DESTINATION"
ditto "$MODEL_SOURCE" "$MODEL_DESTINATION"
`,
    });
    return nextConfig;
  });
}

module.exports = withOfflineTtsAssets;
