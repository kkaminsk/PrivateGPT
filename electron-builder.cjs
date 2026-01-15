const fs = require('fs');

/**
 * Custom electron-builder configuration
 * Uses appxManifestCreated hook to update Windows version targeting
 */
module.exports = {
  appId: "com.privategpt.app",
  productName: "PrivateGPT",
  icon: "icon/icon512.png",
  directories: {
    output: "dist"
  },
  win: {
    target: "appx",
    icon: "dist/.icon-ico/icon.ico"
  },
  appx: {
    identityName: "PrivateGPT",
    publisher: "CN=Big Hat Group Inc., O=Big Hat Group Inc., L=Calgary, S=Alberta, C=CA",
    publisherDisplayName: "PrivateGPT",
    applicationId: "PrivateGPT",
    displayName: "PrivateGPT",
    languages: ["en-US"],
    showNameOnTiles: true,
    backgroundColor: "#1a1a2e",
    artifactName: "${productName}-${version}.msix"
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: true
  },
  mac: {
    target: "dmg"
  },

  /**
   * Hook called after AppxManifest.xml is created
   * Updates MinVersion and MaxVersionTested to modern standards:
   * - MinVersion: 10.0.17763.0 (Windows 10 1809)
   * - MaxVersionTested: 10.0.22621.0 (Windows 11 22H2)
   */
  async appxManifestCreated(manifestPath) {
    let manifest = fs.readFileSync(manifestPath, 'utf8');

    // Update MinVersion from old default (10.0.14316.0) to Windows 10 1809
    manifest = manifest.replace(
      /MinVersion="10\.0\.\d+\.\d+"/,
      'MinVersion="10.0.17763.0"'
    );

    // Update MaxVersionTested to Windows 11 22H2
    manifest = manifest.replace(
      /MaxVersionTested="10\.0\.\d+\.\d+"/,
      'MaxVersionTested="10.0.22621.0"'
    );

    fs.writeFileSync(manifestPath, manifest);
    console.log('Updated AppxManifest.xml with modern Windows version targeting');
  }
};
