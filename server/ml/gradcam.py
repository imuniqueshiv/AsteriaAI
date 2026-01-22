import torch
import torch.nn.functional as F
import numpy as np
import cv2

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

    def generate(self, input_tensor, class_idx=None):
        self.model.eval()
        
        # 1. Capture Activations
        def forward_hook(module, input, output):
            self.activations = output # No detach/clone yet
        
        # 2. Capture Gradients
        def backward_hook(grad):
            self.gradients = grad.detach().clone()

        # Register forward hook
        f_handle = self.target_layer.register_forward_hook(forward_hook)

        # 3. Forward Pass
        output = self.model(input_tensor)
        if class_idx is None:
            class_idx = torch.argmax(output, dim=1).item()
        
        # Register hook on the activation tensor itself, not the module
        # This bypasses the 'BackwardHookFunction' view error
        self.activations.register_hook(backward_hook)

        # 4. Backward Pass
        self.model.zero_grad()
        loss = output[0, class_idx]
        loss.backward()

        # Remove forward hook
        f_handle.remove()

        # 5. Computation
        # Extract and move to device
        grads = self.gradients[0]
        acts = self.activations[0]

        weights = torch.mean(grads, dim=(1, 2))
        cam = torch.zeros(acts.shape[1:], dtype=torch.float32, device=input_tensor.device)

        for i, w in enumerate(weights):
            cam += w * acts[i]

        cam = F.relu(cam)
        
        # Normalize
        cam_min, cam_max = cam.min(), cam.max()
        cam = (cam - cam_min) / (cam_max - cam_min + 1e-8)

        return cam.detach().cpu().numpy()

def overlay_heatmap(heatmap, original_image):
    heatmap = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    if len(original_image.shape) == 2:
        original_image = cv2.cvtColor(original_image, cv2.COLOR_GRAY2BGR)

    overlay = cv2.addWeighted(original_image, 0.6, heatmap, 0.4, 0)
    return overlay